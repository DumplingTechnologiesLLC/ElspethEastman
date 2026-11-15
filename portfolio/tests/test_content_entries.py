from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.authtoken.models import Token

from portfolio.models import ContentEntry, ContentEntryMetadata, MediaAsset, Page, PageKind


class ContentEntryTests(TestCase):
    def setUp(self):
        self.voice = Page.objects.get(kind=PageKind.VOICEOVER)
        self.press = Page.objects.get(kind=PageKind.PRESS)
        self.stream = Page.objects.get(kind=PageKind.STREAMING)
        self.home = Page.objects.get(kind=PageKind.HOME)
        self.asset = MediaAsset.objects.create(file="seed/role.png", width=800, height=600, mime_type="image/png")
        token = Token.objects.create(user=get_user_model().objects.create_user("entry-editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}
        self.base = {"page_id": self.voice.pk, "title": "Tristana", "eyebrow": "League of Legends",
                     "description": "Character summary", "image": {"asset_id": self.asset.pk, "alt_text": "Tristana", "caption": ""},
                     "action": None, "category": None, "published_at": None, "metadata": []}

    def send(self, method, url, data=None):
        return getattr(self.client, method)(url, data=data, content_type="application/json", **self.headers)

    def create(self, **changes):
        response = self.send("post", "/api/content-entries/", {**self.base, **changes})
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()

    def assert_invalid(self, response, field):
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn(field, response.json()["fields"])

    def test_voiceover_role_create_patch_and_delete_return_the_canonical_record(self):
        metadata = [{"key": "details", "label": "The role", "value": "A character"}]
        role = self.create(metadata=metadata)
        self.assertEqual(role["image"]["asset"]["id"], self.asset.pk)
        self.assertIsNone(role["action"])
        self.assertFalse(role["is_featured"])
        self.assertEqual(role["sort_order"], 0)
        endpoint = f"/api/content-entries/{role['id']}/"
        patched = self.send("patch", endpoint, {"title": "Renamed", "action": {"label": "Project", "url": "https://example.invalid/project"}})
        self.assertEqual(patched.status_code, 200, patched.content)
        self.assertEqual(patched.json()["metadata"], role["metadata"])
        self.assertEqual(patched.json()["image"], role["image"])
        self.assertEqual(patched.json()["action"], {"label": "Project", "href": "https://example.invalid/project", "is_external": True})
        self.assertEqual(self.send("patch", endpoint, {"action": None, "metadata": []}).json()["metadata"], [])
        self.assertIsNone(self.send("patch", endpoint, {}).json()["action"])
        deleted = self.send("delete", endpoint)
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(deleted.content, b"")
        self.assertFalse(ContentEntry.objects.filter(pk=role["id"]).exists())
        self.assertFalse(ContentEntryMetadata.objects.exists())
        self.assertTrue(MediaAsset.objects.filter(pk=self.asset.pk).exists())
        self.assertEqual(self.send("patch", endpoint, {}).status_code, 404)
        self.assertEqual(self.send("delete", endpoint).status_code, 404)

    def test_press_requires_outlet_and_normalizes_explicit_publication_time_to_utc(self):
        article = self.create(page_id=self.press.pk, title="Interview", category="Interview",
                              action={"label": "Read", "url": "https://example.invalid/article"},
                              published_at="2026-10-01T14:30:00-04:00",
                              metadata=[{"key": "outlet", "label": "Publication", "value": "Polygon"}])
        self.assertEqual(article["published_at"], "2026-10-01T18:30:00Z")
        endpoint = f"/api/content-entries/{article['id']}/"
        self.assertEqual(self.send("patch", endpoint, {"description": "Updated"}).json()["metadata"], article["metadata"])
        self.assertIsNone(self.send("patch", endpoint, {"published_at": None, "category": None}).json()["published_at"])
        self.assert_invalid(self.send("patch", endpoint, {"metadata": []}), "metadata")
        self.assert_invalid(self.send("patch", endpoint, {"action": None}), "action")
        self.assert_invalid(self.send("patch", endpoint, {"image": None}), "image")
        for value in ("2026-10-01T14:30:00", "nonsense", "2026-99-01T14:30:00Z", 17):
            with self.subTest(value=value):
                self.assert_invalid(self.send("patch", endpoint, {"published_at": value}), "published_at")
        ContentEntryMetadata.objects.filter(entry_id=article["id"]).delete()
        self.assert_invalid(self.send("patch", endpoint, {"title": "No outlet"}), "metadata")

    def test_stream_image_is_optional_and_can_be_replaced_or_cleared(self):
        stream = self.create(page_id=self.stream.pk, title="Recent stream", image=None, category="Collaboration",
                             action={"label": "Watch", "url": "https://example.invalid/watch"})
        self.assertIsNone(stream["image"])
        endpoint = f"/api/content-entries/{stream['id']}/"
        updated = self.send("patch", endpoint, {"image": self.base["image"]})
        self.assertEqual(updated.json()["image"]["alt_text"], "Tristana")
        self.assertIsNone(self.send("patch", endpoint, {"image": None}).json()["image"])
        self.assertEqual(self.send("patch", endpoint, {}).status_code, 200)
        self.assert_invalid(self.send("patch", endpoint, {"action": None}), "action")
        self.assert_invalid(self.send("patch", endpoint, {"published_at": "2026-10-01T00:00:00Z"}), "published_at")

    def test_kind_rules_reject_invalid_owners_and_meaningless_fields(self):
        for changes, field in (({"page_id": self.home.pk}, "page_id"), ({"image": None}, "image"),
                                ({"category": "Game"}, "category"), ({"published_at": "2026-10-01T00:00:00Z"}, "published_at"),
                                ({"page_id": self.press.pk, "action": None}, "action"),
                                ({"page_id": self.press.pk, "action": {"label": "Read", "url": "https://example.invalid"}}, "metadata"),
                                ({"page_id": self.stream.pk}, "action")):
            with self.subTest(changes=changes):
                self.assert_invalid(self.send("post", "/api/content-entries/", {**self.base, **changes}), field)
        self.assertEqual(ContentEntry.objects.count(), 0)

    def test_supplied_nested_values_are_complete_and_cannot_set_identity_or_ownership(self):
        role = self.create()
        endpoint = f"/api/content-entries/{role['id']}/"
        for data, field in (({"page_id": self.press.pk}, "page_id"), ({"is_featured": True}, "is_featured"),
                            ({"id": 999}, "id"), ({"sort_order": 8}, "sort_order"),
                            ({"image": {"asset_id": self.asset.pk}}, "image.alt_text"),
                            ({"image": "invalid"}, "image.non_field_errors"),
                            ({"action": {"url": "https://example.invalid"}}, "action.label"),
                            ({"metadata": [{"key": "details"}]}, "metadata.0.label"),
                            ({"metadata": [{"key": "details", "label": "Label", "value": "Value", "entry_id": 8}]}, "metadata.0.entry_id"),
                            ({"metadata": [{"key": "details", "label": "Label", "value": "Value", "id": 8}]}, "metadata.0.id"),
                            ({"metadata": [{"key": "", "label": "Label", "value": "Value"}]}, "metadata.0.key")):
            with self.subTest(data=data):
                self.assert_invalid(self.send("patch", endpoint, data), field)
        self.assert_invalid(self.send("post", "/api/content-entries/", []), "non_field_errors")
        self.assert_invalid(self.send("post", "/api/content-entries/", {"page_id": self.voice.pk}), "title")
        self.assertEqual(self.send("post", "/api/content-entries/", {**self.base, "page_id": 999999}).status_code, 404)
        self.assertEqual(self.send("patch", endpoint, {"image": {**self.base["image"], "asset_id": 999999}}).status_code, 404)

    def test_metadata_replacement_retains_key_identity_and_applies_array_order(self):
        role = self.create(metadata=[{"key": "details", "label": "Detail", "value": "Old"},
                                     {"key": "remove", "label": "Remove", "value": "Old"}])
        endpoint = f"/api/content-entries/{role['id']}/"
        data = [{"key": "new", "label": "New fact", "value": "New"}, {"key": "details", "label": "Renamed", "value": "Updated"}]
        response = self.send("patch", endpoint, {"metadata": data})
        self.assertEqual(response.status_code, 200)
        rows = response.json()["metadata"]
        self.assertEqual([row["key"] for row in rows], ["new", "details"])
        self.assertEqual([row["sort_order"] for row in rows], [0, 1])
        self.assertEqual(rows[1]["id"], role["metadata"][0]["id"])
        self.assertTrue(all(row["entry_id"] == role["id"] for row in rows))
        self.assertFalse(ContentEntryMetadata.objects.filter(pk=role["metadata"][1]["id"]).exists())
        self.assert_invalid(self.send("patch", endpoint, {"metadata": [data[0], data[0]]}), "metadata")
        self.assertEqual(self.send("patch", endpoint, {"title": "Unrelated"}).json()["metadata"], rows)

    def test_failed_nested_write_rolls_back_entry_and_existing_metadata(self):
        role = self.create(metadata=[{"key": "details", "label": "Detail", "value": "Original"}])
        original_save = ContentEntryMetadata.save

        def interrupted_save(row, *args, **kwargs):
            if row.key == "fail":
                raise RuntimeError("Nested write interrupted")
            return original_save(row, *args, **kwargs)

        data = {"title": "Must roll back", "metadata": [{"key": "details", "label": "Edited", "value": "Edited"},
                                                           {"key": "fail", "label": "Failure", "value": "Failure"}]}
        with patch.object(ContentEntryMetadata, "save", interrupted_save):
            with self.assertRaisesMessage(RuntimeError, "Nested write interrupted"):
                self.send("patch", f"/api/content-entries/{role['id']}/", data)
        entry = ContentEntry.objects.get(pk=role["id"])
        self.assertEqual(entry.title, "Tristana")
        self.assertEqual(list(entry.metadata.values_list("label", "value")), [("Detail", "Original")])

    def test_voiceover_aggregate_prefetches_the_complete_collection_and_feature_identity(self):
        first = self.create(metadata=[{"key": "details", "label": "Detail", "value": "Text"}])
        second = self.create(title="Cadence")
        ContentEntry.objects.filter(pk=second["id"]).update(is_featured=True)
        with self.assertNumQueries(7):
            response = self.client.get(f"/api/pages/{self.voice.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([role["id"] for role in response.json()["roles"]], [first["id"], second["id"]])
        self.assertEqual(response.json()["feature"], {"page_id": self.voice.pk, "item_id": second["id"]})
        self.assertEqual(response.json()["roles"][0]["metadata"], first["metadata"])
        ContentEntry.objects.filter(pk=second["id"]).update(is_featured=False)
        self.assertIsNone(self.client.get(f"/api/pages/{self.voice.pk}/").json()["feature"]["item_id"])

    def test_entries_participate_in_full_membership_reordering_only_on_supported_pages(self):
        first, second = self.create(), self.create(title="Cadence")
        body = {"page_id": self.voice.pk, "collection": "content_entries", "section": None, "ordered_ids": [second["id"], first["id"]]}
        response = self.send("patch", "/api/collections/reorder/", body)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(self.voice.entries.values_list("id", flat=True)), [second["id"], first["id"]])
        self.assert_invalid(self.send("patch", "/api/collections/reorder/", {**body, "page_id": self.home.pk, "ordered_ids": []}), "collection")

    def test_database_constraints_keep_feature_and_metadata_identity_unique(self):
        role = self.create(metadata=[{"key": "details", "label": "Detail", "value": "Text"}])
        with self.assertRaises(IntegrityError), transaction.atomic():
            ContentEntryMetadata.objects.create(entry_id=role["id"], key="details", label="Other", value="Duplicate")
        second = self.create(title="Cadence")
        ContentEntry.objects.filter(pk=role["id"]).update(is_featured=True)
        with self.assertRaises(IntegrityError), transaction.atomic():
            ContentEntry.objects.filter(pk=second["id"]).update(is_featured=True)

    def test_entry_mutations_require_a_valid_token(self):
        role = self.create()
        for method, endpoint in (("post", "/api/content-entries/"), ("patch", f"/api/content-entries/{role['id']}/"), ("delete", f"/api/content-entries/{role['id']}/")):
            with self.subTest(method=method):
                response = getattr(self.client, method)(endpoint, data={}, content_type="application/json")
                self.assertEqual(response.status_code, 403)
