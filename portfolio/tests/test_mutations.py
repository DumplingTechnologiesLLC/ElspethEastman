from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token

from portfolio.api import error_fields
from portfolio.models import Eyebrow, MediaAsset, Page, PageCopy, PageImage, PageKind, TriviaItem


class ContentMutationTests(TestCase):
    def setUp(self):
        self.home = Page.objects.get(kind=PageKind.HOME)
        self.voice = Page.objects.get(kind=PageKind.VOICEOVER)
        self.bio = Page.objects.get(kind=PageKind.BIO)
        token = Token.objects.create(user=get_user_model().objects.create_user("editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}

    def send(self, method, url, data=None):
        return getattr(self.client, method)(url, data=data, content_type="application/json", **self.headers)

    def assert_invalid(self, response, field):
        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(set(response.json()), {"detail", "fields"})
        self.assertIn(field, response.json()["fields"])

    def test_page_metadata_keeps_identity_and_omitted_values_and_clears_external_action(self):
        endpoint = f"/api/v2/pages/{self.voice.public_id}/"
        response = self.send("patch", endpoint, {"title": "Characters", "slug": "characters",
                             "primary_action": {"label": "Play reel", "url": "https://example.invalid/reel"}})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["primary_action"], {"label": "Play reel", "href": "https://example.invalid/reel", "is_external": True})
        self.assertEqual(response.json()["id"], str(self.voice.public_id))
        self.assertEqual(response.json()["kind"], "voiceover")
        self.assertEqual(self.send("patch", endpoint, {"title": "Roles"}).json()["slug"], "characters")
        self.assertEqual(self.send("patch", endpoint, {"primary_action": None}).json()["primary_action"], None)
        self.assertEqual(self.send("patch", f"/api/v2/pages/{self.home.public_id}/", {"slug": ""}).status_code, 200)
        self.assertEqual(self.send("patch", f"/api/v2/pages/{self.bio.public_id}/", {"primary_action": None}).status_code, 200)

    def test_page_metadata_rejects_invalid_routes_and_immutable_identity(self):
        for page, data, field in (
            (self.home, {"slug": "home"}, "slug"), (self.voice, {"slug": ""}, "slug"),
            (self.voice, {"slug": "cms"}, "slug"), (self.voice, {"slug": "API"}, "slug"),
            (self.voice, {"slug": "bio"}, "slug"), (self.voice, {"slug": "two/segments"}, "slug"),
            (self.voice, {"kind": "music"}, "kind"), (self.voice, {"id": '00000000-0000-4000-8000-000000000063'}, "id"),
            (self.voice, {"title": "  "}, "title"),
            (self.bio, {"primary_action": {"label": "Listen", "url": "https://example.invalid"}}, "primary_action"),
            (self.voice, {"primary_action": {"label": "FTP", "url": "ftp://example.invalid"}}, "primary_action.url"),
            (self.voice, {"primary_action": {"label": "Internal", "url": "/music"}}, "primary_action.url"),
            (self.voice, {"primary_action": {"label": "", "url": "https://example.invalid"}}, "primary_action.label"),
        ):
            with self.subTest(data=data):
                self.assert_invalid(self.send("patch", f"/api/v2/pages/{page.public_id}/", data), field)
        self.voice.refresh_from_db()
        self.assertEqual(self.voice.slug, "voiceover")
        self.assertEqual(self.send("patch", "/api/v2/pages/00000000-0000-4000-8000-0000000f423f/", {}).status_code, 404)

    def test_copy_supports_create_patch_and_delete_without_reassigning_its_address(self):
        body = {"page_id": str(self.home.public_id), "key": "intro-one", "section": "intro", "kind": "body", "value": "First"}
        first = self.send("post", "/api/v2/pages/copy/", body)
        self.assertEqual(first.status_code, 201)
        second = self.send("post", "/api/v2/pages/copy/", {**body, "key": "intro-two", "value": "<b>Plain text</b>"})
        self.assertEqual(second.json()["sort_order"], 1)
        self.assertEqual(second.json()["value"], "<b>Plain text</b>")
        address = {"page_id": str(self.home.public_id), "key": "intro-one"}
        updated = self.send("patch", "/api/v2/pages/copy/", {**address, "kind": "headline", "value": "Edited"})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["id"], first.json()["id"])
        self.assertEqual(updated.json()["section"], "intro")
        self.assertEqual(self.send("patch", "/api/v2/pages/copy/", address).json()["value"], "Edited")
        deleted = self.send("delete", f"/api/v2/pages/copy/?page_id={self.home.public_id}&key=intro-one")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(deleted.content, b"")
        self.assertFalse(PageCopy.objects.filter(public_id=first.json()["id"]).exists())
        self.assertEqual(self.send("delete", f"/api/v2/pages/copy/?page_id={self.home.public_id}&key=absent").status_code, 404)

    def test_copy_validates_page_regions_treatments_keys_and_required_addresses(self):
        base = {"page_id": str(self.voice.public_id), "key": "intro", "section": "intro", "kind": "body", "value": "Introduction"}
        self.assertEqual(self.send("post", "/api/v2/pages/copy/", base).status_code, 201)
        for data, field in ((base, "key"), ({**base, "section": "unsupported"}, "section"),
                            ({**base, "kind": "section_label"}, "kind"),
                            ({**base, "section": "roles"}, "kind"), ({**base, "kind": "unknown"}, "kind"),
                            ({**base, "sort_order": 99}, "sort_order")):
            with self.subTest(data=data):
                self.assert_invalid(self.send("post", "/api/v2/pages/copy/", data), field)
        section_label = {**base, "key": "roles-title", "section": "roles", "kind": "section_label"}
        self.assertEqual(self.send("post", "/api/v2/pages/copy/", section_label).status_code, 201)
        self.assert_invalid(self.send("patch", "/api/v2/pages/copy/", {"page_id": str(self.voice.public_id), "key": "intro", "section": "roles"}), "section")
        self.assert_invalid(self.send("patch", "/api/v2/pages/copy/", {"page_id": str(self.voice.public_id), "key": "roles-title", "kind": "body"}), "kind")
        self.assert_invalid(self.send("patch", "/api/v2/pages/copy/", {"page_id": str(self.voice.public_id)}), "key")
        self.assert_invalid(self.send("delete", "/api/v2/pages/copy/"), "page_id")
        self.assertEqual(self.send("patch", "/api/v2/pages/copy/", {"page_id": str(self.bio.public_id), "key": "intro"}).status_code, 404)
        self.assertEqual(self.send("post", "/api/v2/pages/copy/", {**base, "page_id": '00000000-0000-4000-8000-0000000f423f'}).status_code, 404)
        self.assert_invalid(self.send("post", "/api/v2/pages/copy/", []), "non_field_errors")

    def test_owned_collections_append_patch_and_delete_and_keep_page_immutable(self):
        for endpoint, model, fields in (("pages/eyebrows", Eyebrow, {"label": "Voice actor"}),
                                         ("pages/trivia", TriviaItem, {"label": "Based in", "value": "Seattle"})):
            with self.subTest(collection=endpoint):
                url = f"/api/v2/{endpoint}/"
                first = self.send("post", url, {"page_id": str(self.voice.public_id), **fields})
                self.assertEqual(first.status_code, 201)
                second = self.send("post", url, {"page_id": str(self.voice.public_id), **fields})
                self.assertEqual(second.json()["sort_order"], 1)
                detail = f"{url}{first.json()['id']}/"
                updated = self.send("patch", detail, {"label": "Updated"})
                self.assertEqual(updated.status_code, 200)
                self.assertEqual(updated.json()["page_id"], str(self.voice.public_id))
                self.assertEqual(self.send("patch", detail, {}).json()["label"], "Updated")
                self.assert_invalid(self.send("patch", detail, {"page_id": str(self.bio.public_id)}), "page_id")
                self.assert_invalid(self.send("patch", detail, {"sort_order": 5}), "sort_order")
                deleted = self.send("delete", detail)
                self.assertEqual(deleted.status_code, 204)
                self.assertEqual(deleted.content, b"")
                self.assertEqual(self.send("patch", detail, fields).status_code, 404)
                self.assertEqual(self.send("delete", detail).status_code, 404)
                self.assertEqual(self.send("post", f"{url}{second.json()['id']}/", fields).status_code, 405)
                self.assertEqual(model.objects.filter(page=self.voice).count(), 1)

    def test_trivia_limit_does_not_write_a_fourth_fact_and_other_pages_are_independent(self):
        for position in range(3):
            response = self.send("post", "/api/v2/pages/trivia/", {"page_id": str(self.voice.public_id), "label": str(position), "value": "Fact"})
            self.assertEqual(response.status_code, 201)
        self.assert_invalid(self.send("post", "/api/v2/pages/trivia/", {"page_id": str(self.voice.public_id), "label": "Fourth", "value": "Fact"}), "page_id")
        self.assertEqual(TriviaItem.objects.filter(page=self.voice).count(), 3)
        self.assertEqual(self.send("post", "/api/v2/pages/trivia/", {"page_id": str(self.bio.public_id), "label": "First", "value": "Fact"}).status_code, 201)

    def test_page_image_replaces_an_existing_slot_and_returns_contextual_metadata(self):
        first = MediaAsset.objects.create(file="seed/first.png", width=100, height=200, mime_type="image/png")
        replacement = MediaAsset.objects.create(file="seed/next.webp", width=200, height=300, mime_type="image/webp")
        slot = PageImage.objects.create(page=self.home, key="hero", asset=first, alt_text="Original")
        payload = {"page_id": str(self.home.public_id), "key": "hero", "image": {"asset_id": str(replacement.public_id), "alt_text": "New portrait", "caption": "In the studio"}}
        response = self.send("patch", "/api/v2/pages/images/", payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["image"]["asset"]["id"], str(replacement.public_id))
        self.assertEqual(response.json()["image"]["caption"], "In the studio")
        slot.refresh_from_db()
        self.assertEqual(slot.asset_id, replacement.pk)
        self.assertEqual(MediaAsset.objects.count(), 2)
        self.assertEqual(self.send("patch", "/api/v2/pages/images/", {**payload, "key": "new-slot"}).status_code, 404)
        self.assertEqual(self.send("patch", "/api/v2/pages/images/", {**payload, "image": {**payload["image"], "asset_id": '00000000-0000-4000-8000-0000000f423f'}}).status_code, 404)
        self.assert_invalid(self.send("patch", "/api/v2/pages/images/", {**payload, "image": {**payload["image"], "alt_text": " "}}), "image.alt_text")
        self.assert_invalid(self.send("patch", "/api/v2/pages/images/", {**payload, "image": {**payload["image"], "asset": {}}}), "image.asset")

    def test_reorder_replaces_full_order_and_scopes_copy_by_section(self):
        first = PageCopy.objects.create(page=self.voice, key="one", section="intro", kind="body", value="One", sort_order=8)
        second = PageCopy.objects.create(page=self.voice, key="two", section="intro", kind="body", value="Two", sort_order=9)
        heading = PageCopy.objects.create(page=self.voice, key="label", section="roles", kind="section_label", value="Roles", sort_order=6)
        body = {"page_id": str(self.voice.public_id), "collection": "copy", "section": "intro", "ordered_ids": [str(second.public_id), str(first.public_id)]}
        response = self.send("patch", "/api/v2/collections/reorder/", body)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), body)
        self.assertEqual(list(self.voice.copy.filter(section="intro").values_list("id", "sort_order")), [(second.pk, 0), (first.pk, 1)])
        heading.refresh_from_db()
        self.assertEqual(heading.sort_order, 6)
        eyebrow = Eyebrow.objects.create(page=self.voice, label="Voice actor", sort_order=10)
        for collection, ids in (("eyebrows", [str(eyebrow.public_id)]), ("trivia", [])):
            payload = {**body, "collection": collection, "section": None, "ordered_ids": ids}
            self.assertEqual(self.send("patch", "/api/v2/collections/reorder/", payload).json(), payload)

    def test_reorder_rejects_duplicates_missing_foreign_ids_and_invalid_scopes_before_writing(self):
        first = Eyebrow.objects.create(page=self.voice, label="Actor", sort_order=4)
        second = Eyebrow.objects.create(page=self.voice, label="Musician", sort_order=5)
        foreign = Eyebrow.objects.create(page=self.bio, label="Other")
        base = {"page_id": str(self.voice.public_id), "collection": "eyebrows", "section": None, "ordered_ids": [str(second.public_id), str(first.public_id)]}
        for data, field in (({**base, "ordered_ids": [str(first.public_id), str(first.public_id)]}, "ordered_ids"),
                            ({**base, "ordered_ids": [str(first.public_id)]}, "ordered_ids"),
                            ({**base, "ordered_ids": [str(first.public_id), str(foreign.public_id)]}, "ordered_ids"),
                            ({**base, "section": "intro"}, "section"),
                            ({**base, "collection": "copy"}, "section"),
                            ({**base, "collection": "copy", "section": "unknown"}, "section"),
                            ({**base, "collection": "Page"}, "collection")):
            with self.subTest(data=data):
                self.assert_invalid(self.send("patch", "/api/v2/collections/reorder/", data), field)
                self.assertEqual(list(Eyebrow.objects.filter(page=self.voice).values_list("sort_order", flat=True)), [4, 5])

    def test_failed_reorder_rolls_back_even_after_a_database_write(self):
        first = Eyebrow.objects.create(page=self.voice, label="Actor", sort_order=4)
        second = Eyebrow.objects.create(page=self.voice, label="Musician", sort_order=5)

        def fail_after_write(rows, fields):
            Eyebrow.objects.filter(pk=rows[0].pk).update(sort_order=0)
            raise RuntimeError("Database interrupted")

        with patch.object(Eyebrow.objects, "bulk_update", side_effect=fail_after_write):
            with self.assertRaisesMessage(RuntimeError, "Database interrupted"):
                self.send("patch", "/api/v2/collections/reorder/", {"page_id": str(self.voice.public_id), "collection": "eyebrows", "section": None, "ordered_ids": [str(second.public_id), str(first.public_id)]})
        self.assertEqual(list(Eyebrow.objects.filter(page=self.voice).values_list("sort_order", flat=True)), [4, 5])

    def test_public_references_reject_numeric_malformed_and_non_v4_identifiers(self):
        body = {"page_id": str(self.home.public_id), "key": "intro", "section": "intro", "kind": "body", "value": "Copy"}
        for identifier in (self.home.pk, "invalid", "00000000-0000-1000-8000-000000000001"):
            with self.subTest(identifier=identifier):
                self.assert_invalid(self.send("post", "/api/v2/pages/copy/", {**body, "page_id": identifier}), "page_id")
        self.assertFalse(PageCopy.objects.filter(page=self.home).exists())

    def test_error_fields_preserves_nested_array_paths_and_non_field_messages(self):
        self.assertEqual(error_fields({"metadata": [{"value": ["Required"]}, ["Invalid"]]}),
                         {"metadata.0.value": ["Required"], "metadata.1": ["Invalid"]})
        self.assertEqual(error_fields("Invalid"), {"non_field_errors": ["Invalid"]})

    def test_every_mutation_surface_requires_a_token(self):
        cases = (("patch", f"/api/v2/pages/{self.home.public_id}/"), ("post", "/api/v2/pages/copy/"), ("patch", "/api/v2/pages/copy/"),
                 ("delete", "/api/v2/pages/copy/"), ("patch", "/api/v2/pages/images/"), ("patch", "/api/v2/collections/reorder/"),
                 ("post", "/api/v2/pages/eyebrows/"), ("patch", "/api/v2/pages/eyebrows/00000000-0000-4000-8000-000000000001/"), ("delete", "/api/v2/pages/eyebrows/00000000-0000-4000-8000-000000000001/"),
                 ("post", "/api/v2/pages/trivia/"), ("patch", "/api/v2/pages/trivia/00000000-0000-4000-8000-000000000001/"), ("delete", "/api/v2/pages/trivia/00000000-0000-4000-8000-000000000001/"))
        for method, endpoint in cases:
            with self.subTest(endpoint=endpoint, method=method):
                response = getattr(self.client, method)(endpoint, data={}, content_type="application/json")
                self.assertEqual(response.status_code, 403)
