from django.test import TestCase
from portfolio.models import Eyebrow, MediaAsset, Page, PageCopy, PageImage, PageKind, TriviaItem


class ContentReadTests(TestCase):
    def setUp(self):
        self.home = Page.objects.get(kind=PageKind.HOME)
        self.voiceover = Page.objects.get(kind=PageKind.VOICEOVER)

    def test_registry_is_public_and_reflects_current_metadata_without_changing_identity(self):
        self.voiceover.title = "Characters"
        self.voiceover.slug = "characters"
        self.voiceover.primary_action_label = "Play reel"
        self.voiceover.primary_action_url = "https://example.invalid/reel"
        self.voiceover.save()
        with self.assertNumQueries(1):
            response = self.client.get("/api/site/")
        self.assertEqual(response.status_code, 200)
        records = response.json()["pages"]
        self.assertEqual(len(records), 6)
        record = next(row for row in records if row["id"] == self.voiceover.pk)
        self.assertEqual(record, {"id": self.voiceover.pk, "kind": "voiceover", "title": "Characters",
                                  "slug": "characters", "primary_action": {"label": "Play reel",
                                  "href": "https://example.invalid/reel", "is_external": True}})
        self.assertIsNone(next(row for row in records if row["kind"] == "home")["primary_action"])

    def test_home_aggregate_is_public_and_keeps_ordered_owned_content_together(self):
        later = PageCopy.objects.create(page=self.home, key="later", section="intro", kind="body", value="Later", sort_order=2)
        first = PageCopy.objects.create(page=self.home, key="first", section="intro", kind="headline", value="First", sort_order=0)
        label = Eyebrow.objects.create(page=self.home, label="Voice actor")
        fact = TriviaItem.objects.create(page=self.home, label="Since", value="2012")
        asset = MediaAsset.objects.create(file="seed/home.png", width=800, height=900, mime_type="image/png", credit="Photographer")
        PageImage.objects.create(page=self.home, key="hero", asset=asset, alt_text="Elspeth smiling", caption="Portrait")
        with self.assertNumQueries(5):
            response = self.client.get(f"/api/pages/{self.home.pk}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(set(data), {"page", "copy", "images", "eyebrows", "trivia"})
        self.assertEqual(data["page"]["id"], self.home.pk)
        self.assertEqual([row["id"] for row in data["copy"]], [first.pk, later.pk])
        self.assertEqual(data["copy"][0], {"id": first.pk, "page_id": self.home.pk, "key": "first", "section": "intro",
                                          "kind": "headline", "value": "First", "sort_order": 0})
        self.assertEqual(data["eyebrows"], [{"id": label.pk, "page_id": self.home.pk, "label": "Voice actor", "sort_order": 0}])
        self.assertEqual(data["trivia"], [{"id": fact.pk, "page_id": self.home.pk, "label": "Since", "value": "2012", "sort_order": 0}])
        image = data["images"][0]
        self.assertEqual(set(image), {"page_id", "key", "image"})
        self.assertEqual(image["image"]["alt_text"], "Elspeth smiling")
        self.assertEqual(image["image"]["asset"]["url"], "/static/redesign/home.png")
        self.assertEqual(image["image"]["asset"]["credit"], "Photographer")
        self.assertEqual(set(image["image"]["asset"]), {"id", "url", "width", "height", "mime_type", "credit", "source_url", "created_at"})

    def test_multiple_images_do_not_add_queries_and_uploads_use_the_storage_url(self):
        for key in ("portrait", "detail"):
            asset = MediaAsset.objects.create(file=f"uploads/{key}.webp", width=100, height=200, mime_type="image/webp")
            PageImage.objects.create(page=self.home, key=key, asset=asset, alt_text=key)
        with self.assertNumQueries(5):
            response = self.client.get(f"/api/pages/{self.home.pk}/")
        self.assertEqual([row["image"]["asset"]["url"] for row in response.json()["images"]],
                         ["/media/uploads/portrait.webp", "/media/uploads/detail.webp"])

    def test_unknown_pages_return_explicit_missing_responses(self):
        response = self.client.get("/api/pages/999999/")
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

    def test_read_only_surfaces_cannot_be_changed_anonymously(self):
        before = list(Page.objects.values())
        for url in ("/api/site/", f"/api/pages/{self.home.pk}/"):
            with self.subTest(url=url):
                response = self.client.patch(url, data={"title": "Forbidden"}, content_type="application/json")
                self.assertEqual(response.status_code, 403)
        self.assertEqual(list(Page.objects.values()), before)
