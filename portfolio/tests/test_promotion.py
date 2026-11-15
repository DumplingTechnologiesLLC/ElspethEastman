from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from portfolio.tests.base import EmptyPortfolioTestCase as TestCase
from rest_framework.authtoken.models import Token

from portfolio.models import ContentEntry, MediaAsset, Page, PageKind


class PromotionTests(TestCase):
    def setUp(self):
        self.voice = Page.objects.get(kind=PageKind.VOICEOVER)
        self.stream = Page.objects.get(kind=PageKind.STREAMING)
        self.home = Page.objects.get(kind=PageKind.HOME)
        self.asset = MediaAsset.objects.create(file="seed/role.png", width=800, height=600, mime_type="image/png")
        self.first = ContentEntry.objects.create(page=self.voice, title="Tristana", eyebrow="League", description="Summary",
                                                  asset=self.asset, alt_text="Tristana", sort_order=3)
        self.second = ContentEntry.objects.create(page=self.voice, title="Cadence", eyebrow="NecroDancer", description="Summary",
                                                   asset=self.asset, alt_text="Cadence", sort_order=4)
        self.imageless = ContentEntry.objects.create(page=self.stream, title="Stream", eyebrow="Game", description="Summary",
                                                      action_label="Watch", action_url="https://example.invalid/watch")
        token = Token.objects.create(user=get_user_model().objects.create_user("feature-editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}

    def send(self, method, url, data=None):
        return getattr(self.client, method)(url, data=data, content_type="application/json", **self.headers)

    def promote(self, item_id, page=None):
        return self.send("patch", "/api/featured-items/", {"page_id": (page or self.voice).pk, "item_id": item_id})

    def test_promote_switch_and_demote_reuse_records_without_changing_manual_order(self):
        original = list(self.voice.entries.values_list("id", "sort_order"))
        for selection in (self.first.pk, self.first.pk, self.second.pk, None):
            response = self.promote(selection)
            self.assertEqual(response.status_code, 200, response.content)
            self.assertEqual(response.json(), {"page_id": self.voice.pk, "item_id": selection})
            self.assertEqual(list(self.voice.entries.filter(is_featured=True).values_list("pk", flat=True)), [] if selection is None else [selection])
            self.assertEqual(list(self.voice.entries.values_list("id", "sort_order")), original)
        self.assertEqual(self.voice.entries.count(), 2)

    def test_missing_foreign_imageless_and_unsupported_selections_leave_previous_hero_unchanged(self):
        self.assertEqual(self.promote(self.first.pk).status_code, 200)
        for item_id, page, expected in ((999999, self.voice, 404), (self.imageless.pk, self.voice, 404),
                                         (self.imageless.pk, self.stream, 400), (None, self.home, 400)):
            with self.subTest(item_id=item_id, page=page.kind):
                response = self.promote(item_id, page)
                self.assertEqual(response.status_code, expected)
                self.assertIn("detail", response.json())
                self.assertEqual(list(self.voice.entries.filter(is_featured=True).values_list("pk", flat=True)), [self.first.pk])
        self.assertEqual(self.send("patch", "/api/featured-items/", {"page_id": self.voice.pk}).status_code, 400)
        self.assertEqual(self.send("patch", "/api/featured-items/", {"page_id": self.voice.pk, "item_id": 0}).status_code, 400)

    def test_reordering_requires_the_featured_member_and_keeps_its_selection(self):
        self.promote(self.first.pk)
        payload = {"page_id": self.voice.pk, "collection": "content_entries", "section": None, "ordered_ids": [self.second.pk]}
        self.assertEqual(self.send("patch", "/api/collections/reorder/", payload).status_code, 400)
        self.assertEqual(self.send("patch", "/api/collections/reorder/", {**payload, "ordered_ids": [self.second.pk, self.first.pk]}).status_code, 200)
        self.first.refresh_from_db()
        self.assertTrue(self.first.is_featured)
        self.assertEqual(self.first.sort_order, 1)
        self.promote(None)
        self.assertEqual(list(self.voice.entries.values_list("pk", flat=True)), [self.second.pk, self.first.pk])

    def test_editing_a_featured_record_changes_its_canonical_content_and_deleting_it_clears_selection(self):
        self.promote(self.first.pk)
        endpoint = f"/api/content-entries/{self.first.pk}/"
        edited = self.send("patch", endpoint, {"title": "Updated hero"})
        self.assertTrue(edited.json()["is_featured"])
        aggregate = self.client.get(f"/api/pages/{self.voice.pk}/").json()
        self.assertEqual(next(row for row in aggregate["roles"] if row["id"] == aggregate["feature"]["item_id"])["title"], "Updated hero")
        self.assertEqual(self.send("delete", endpoint).status_code, 204)
        aggregate = self.client.get(f"/api/pages/{self.voice.pk}/").json()
        self.assertIsNone(aggregate["feature"]["item_id"])
        self.assertEqual([row["id"] for row in aggregate["roles"]], [self.second.pk])

    def test_featured_stream_cannot_lose_its_image_until_demoted(self):
        ContentEntry.objects.filter(pk=self.imageless.pk).update(asset=self.asset, alt_text="Stream artwork")
        self.assertEqual(self.promote(self.imageless.pk, self.stream).status_code, 200)
        endpoint = f"/api/content-entries/{self.imageless.pk}/"
        response = self.send("patch", endpoint, {"image": None})
        self.assertEqual(response.status_code, 400)
        self.assertIn("image", response.json()["fields"])
        self.assertEqual(self.promote(None, self.stream).status_code, 200)
        self.assertEqual(self.send("patch", endpoint, {"image": None}).status_code, 200)

    def test_failed_promotion_rolls_back_its_prior_demotion(self):
        self.promote(self.first.pk)
        with patch.object(ContentEntry, "save", side_effect=RuntimeError("Promotion interrupted")):
            with self.assertRaisesMessage(RuntimeError, "Promotion interrupted"):
                self.promote(self.second.pk)
        self.assertEqual(list(self.voice.entries.filter(is_featured=True).values_list("pk", flat=True)), [self.first.pk])

    def test_database_constraint_prevents_uncoordinated_imageless_promotion(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            ContentEntry.objects.filter(pk=self.imageless.pk).update(is_featured=True)

    def test_promotion_requires_authentication(self):
        response = self.client.patch("/api/featured-items/", {"page_id": self.voice.pk, "item_id": self.first.pk}, content_type="application/json")
        self.assertEqual(response.status_code, 403)
