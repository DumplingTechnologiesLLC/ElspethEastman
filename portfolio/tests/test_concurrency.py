from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.test import TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from portfolio.models import Page, PageKind, TriviaItem


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
