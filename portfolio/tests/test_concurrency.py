from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.test import TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from portfolio.models import ContentEntry, MediaAsset, Page, PageKind, TriviaItem


@skipUnless(connection.vendor == "postgresql", "Row-lock guarantees run against PostgreSQL in CI.")
class ContentConcurrencyTests(TransactionTestCase):
    def setUp(self):
        self.voice, _ = Page.objects.get_or_create(kind=PageKind.VOICEOVER, defaults={"title": "Voiceover", "slug": "voiceover"})
        self.press, _ = Page.objects.get_or_create(kind=PageKind.PRESS, defaults={"title": "Press", "slug": "press"})
        token = Token.objects.create(user=get_user_model().objects.create_user("concurrent-editor"))
        self.authorization = f"Token {token.key}"

    def run_concurrently(self, requests):
        start = Barrier(len(requests))

        def submit(method, url, data):
            close_old_connections()
            try:
                client = APIClient()
                client.credentials(HTTP_AUTHORIZATION=self.authorization)
                start.wait(timeout=10)
                return getattr(client, method)(url, data, format="json").status_code
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=len(requests)) as executor:
            futures = [executor.submit(submit, *request) for request in requests]
            return sorted(future.result(timeout=15) for future in futures)

    def test_competing_creates_cannot_exceed_three_facts(self):
        for label in ("One", "Two"):
            TriviaItem.objects.create(page=self.voice, label=label, value="Fact")
        body = {"page_id": self.voice.pk, "label": "New", "value": "Fact"}
        statuses = self.run_concurrently([("post", "/api/trivia/", body), ("post", "/api/trivia/", body)])
        self.assertEqual(statuses, [201, 400])
        self.assertEqual(TriviaItem.objects.filter(page=self.voice).count(), 3)

    def test_competing_page_renames_return_a_field_error_for_the_losing_claim(self):
        statuses = self.run_concurrently([
            ("patch", f"/api/pages/{self.voice.pk}/", {"slug": "shared-route"}),
            ("patch", f"/api/pages/{self.press.pk}/", {"slug": "shared-route"}),
        ])
        self.assertEqual(statuses, [200, 400])
        self.assertEqual(Page.objects.filter(slug="shared-route").count(), 1)

    def test_competing_promotions_finish_with_one_canonical_hero(self):
        asset = MediaAsset.objects.create(file="seed/image.png", width=10, height=10, mime_type="image/png")
        entries = [ContentEntry.objects.create(page=self.voice, title=title, eyebrow="Game", description="Summary", asset=asset, alt_text=title)
                   for title in ("First", "Second")]
        statuses = self.run_concurrently([("patch", "/api/featured-items/", {"page_id": self.voice.pk, "item_id": entry.pk}) for entry in entries])
        self.assertEqual(statuses, [200, 200])
        self.assertEqual(self.voice.entries.filter(is_featured=True).count(), 1)
        self.assertEqual(self.voice.entries.count(), 2)

    def test_image_removal_and_promotion_cannot_leave_an_imageless_hero(self):
        stream, _ = Page.objects.get_or_create(kind=PageKind.STREAMING, defaults={"title": "Streaming", "slug": "streaming"})
        asset = MediaAsset.objects.create(file="seed/image.png", width=10, height=10, mime_type="image/png")
        entry = ContentEntry.objects.create(page=stream, title="Stream", eyebrow="Game", description="Summary", asset=asset,
                                            alt_text="Stream", action_label="Watch", action_url="https://example.invalid/watch")
        statuses = self.run_concurrently([
            ("patch", "/api/featured-items/", {"page_id": stream.pk, "item_id": entry.pk}),
            ("patch", f"/api/content-entries/{entry.pk}/", {"image": None}),
        ])
        self.assertEqual(statuses, [200, 400])
        entry.refresh_from_db()
        self.assertFalse(entry.is_featured and entry.asset_id is None)

    def test_create_and_reorder_share_one_membership_boundary(self):
        first = TriviaItem.objects.create(page=self.voice, label="First", value="Fact", sort_order=0)
        second = TriviaItem.objects.create(page=self.voice, label="Second", value="Fact", sort_order=1)
        statuses = self.run_concurrently([
            ("post", "/api/trivia/", {"page_id": self.voice.pk, "label": "Third", "value": "Fact"}),
            ("patch", "/api/collections/reorder/", {"page_id": self.voice.pk, "collection": "trivia", "section": None, "ordered_ids": [second.pk, first.pk]}),
        ])
        self.assertIn(statuses, ([200, 201], [201, 400]))
        rows = list(self.voice.trivia.values_list("label", "sort_order"))
        self.assertIn(rows, ([('First', 0), ('Second', 1), ('Third', 2)], [('Second', 0), ('First', 1), ('Third', 2)]))
