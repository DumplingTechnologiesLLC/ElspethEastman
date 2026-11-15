from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token

from portfolio.models import Appearance, BioChapter, ContentEntry, ContentEntryMetadata, CurrentItem, MediaAsset, Page, PageKind, StreamClip


class PageCollectionTests(TestCase):
    def setUp(self):
        self.pages = {page.kind: page for page in Page.objects.all()}
        token = Token.objects.create(user=get_user_model().objects.create_user("collection-editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}
        self.cases = [
            ("stream-clips", "stream_clips", PageKind.STREAMING, StreamClip,
             {"eyebrow": "Game", "title": "Highlights", "category": "Highlights", "action": {"label": "Play", "url": "https://example.invalid/clip"}}, {"title": "New highlights"}),
            ("appearances", "appearances", PageKind.PRESS, Appearance,
             {"year": "2026", "title": "Convention", "format": "Panel", "url": None}, {"title": "New convention"}),
            ("bio-chapters", "bio_chapters", PageKind.BIO, BioChapter,
             {"eyebrow": "Early years", "heading": "The beginning", "body": "A chapter of the biography"}, {"heading": "Another chapter"}),
            ("current-items", "current_items", PageKind.BIO, CurrentItem,
             {"eyebrow": "Music", "title": "Practice", "description": "Current work", "link": None}, {"title": "Composition"}),
        ]

    def send(self, method, endpoint, data=None):
        return getattr(self.client, method)(endpoint, data=data, content_type="application/json", **self.headers)

    def test_each_collection_has_owned_ordered_crud_with_canonical_partial_responses(self):
        for endpoint, collection, kind, model, fields, changes in self.cases:
            with self.subTest(collection=collection):
                page = self.pages[kind]
                url = f"/api/{endpoint}/"
                first = self.send("post", url, {"page_id": page.pk, **fields})
                self.assertEqual(first.status_code, 201, first.content)
                second = self.send("post", url, {"page_id": page.pk, **fields})
                self.assertEqual(second.json()["sort_order"], 1)
                detail = f"{url}{first.json()['id']}/"
                edited = self.send("patch", detail, changes)
                self.assertEqual(edited.status_code, 200, edited.content)
                self.assertEqual(edited.json()["page_id"], page.pk)
                for field, value in changes.items():
                    self.assertEqual(edited.json()[field], value)
                self.assertEqual(self.send("patch", detail, {}).json(), edited.json())
                for forbidden in ("page_id", "sort_order", "id"):
                    response = self.send("patch", detail, {forbidden: self.pages[PageKind.HOME].pk})
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(forbidden, response.json()["fields"])
                self.assertEqual(self.send("post", detail, fields).status_code, 405)
                deleted = self.send("delete", detail)
                self.assertEqual(deleted.status_code, 204)
                self.assertEqual(deleted.content, b"")
                self.assertEqual(model.objects.filter(page=page).count(), 1)
                self.assertEqual(self.send("patch", detail, changes).status_code, 404)
                self.assertEqual(self.send("delete", detail).status_code, 404)

    def test_kind_and_required_field_validation_prevents_writes_to_the_wrong_page(self):
        for endpoint, collection, kind, model, fields, _ in self.cases:
            with self.subTest(collection=collection):
                url = f"/api/{endpoint}/"
                response = self.send("post", url, {"page_id": self.pages[PageKind.HOME].pk, **fields})
                self.assertEqual(response.status_code, 400, response.content)
                self.assertIn("page_id", response.json()["fields"])
                self.assertEqual(self.send("post", url, {"page_id": self.pages[kind].pk}).status_code, 400)
                self.assertEqual(self.send("post", url, {"page_id": 999999, **fields}).status_code, 404)
                self.assertEqual(model.objects.count(), 0)

    def test_current_work_link_can_be_added_preserved_replaced_and_cleared(self):
        page = self.pages[PageKind.BIO]
        response = self.send("post", "/api/current-items/", {"page_id": page.pk, "eyebrow": "Music", "title": "Practice", "description": "Notes", "link": None})
        self.assertIsNone(response.json()["link"])
        endpoint = f"/api/current-items/{response.json()['id']}/"
        response = self.send("patch", endpoint, {"link": {"label": "Listen", "url": "https://example.invalid/music"}})
        self.assertEqual(response.json()["link"], {"label": "Listen", "href": "https://example.invalid/music", "is_external": True})
        self.assertEqual(self.send("patch", endpoint, {"title": "New title"}).json()["link"], response.json()["link"])
        self.assertIsNone(self.send("patch", endpoint, {"link": None}).json()["link"])
        for data, field in (({"link": {"url": "https://example.invalid"}}, "link.label"),
                            ({"link": {"label": "Bad", "url": "javascript:alert(1)"}}, "link.url"),
                            ({"link_url": "https://example.invalid"}, "link_url")):
            response = self.send("patch", endpoint, data)
            self.assertEqual(response.status_code, 400)
            self.assertIn(field, response.json()["fields"])

    def test_appearance_urls_are_optional_http_destinations(self):
        page = self.pages[PageKind.PRESS]
        response = self.send("post", "/api/appearances/", {"page_id": page.pk, "year": "2026", "title": "Panel", "format": "Panel", "url": "https://example.invalid/panel"})
        endpoint = f"/api/appearances/{response.json()['id']}/"
        self.assertEqual(response.json()["url"], "https://example.invalid/panel")
        self.assertIsNone(self.send("patch", endpoint, {"url": None}).json()["url"])
        self.assertEqual(self.send("patch", endpoint, {"url": "ftp://example.invalid/panel"}).status_code, 400)

    def test_clips_have_their_own_actions_and_are_not_recent_stream_entries(self):
        page = self.pages[PageKind.STREAMING]
        response = self.send("post", "/api/stream-clips/", {"page_id": page.pk, "eyebrow": "Game", "title": "Clip", "category": "Highlights",
                                                             "action": {"label": "Play", "url": "https://example.invalid/clip"}})
        self.assertEqual(response.json()["action"], {"label": "Play", "href": "https://example.invalid/clip", "is_external": True})
        endpoint = f"/api/stream-clips/{response.json()['id']}/"
        self.assertEqual(self.send("patch", endpoint, {"action": {"label": "Watch", "url": "https://example.invalid/watch"}}).json()["action"]["label"], "Watch")
        self.assertEqual(self.send("patch", endpoint, {"action": None}).status_code, 400)
        self.assertEqual(self.send("patch", endpoint, {"is_featured": True}).status_code, 400)
        self.assertEqual(ContentEntry.objects.filter(page=page).count(), 0)
        feature = self.send("patch", "/api/featured-items/", {"page_id": page.pk, "item_id": response.json()["id"]})
        self.assertEqual(feature.status_code, 404)

    def test_each_collection_reorders_only_within_its_own_page_kind(self):
        for endpoint, collection, kind, model, fields, _ in self.cases:
            with self.subTest(collection=collection):
                page = self.pages[kind]
                first = self.send("post", f"/api/{endpoint}/", {"page_id": page.pk, **fields}).json()
                second = self.send("post", f"/api/{endpoint}/", {"page_id": page.pk, **fields}).json()
                order = {"page_id": page.pk, "collection": collection, "section": None, "ordered_ids": [second["id"], first["id"]]}
                self.assertEqual(self.send("patch", "/api/collections/reorder/", order).json(), order)
                self.assertEqual(list(model.objects.filter(page=page).values_list("id", flat=True)), [second["id"], first["id"]])
                self.assertEqual(self.send("patch", "/api/collections/reorder/", {**order, "page_id": self.pages[PageKind.HOME].pk, "ordered_ids": []}).status_code, 400)

    def test_streaming_and_press_aggregates_keep_distinct_collections_and_avoid_extra_queries(self):
        asset = MediaAsset.objects.create(file="seed/image.png", width=800, height=600, mime_type="image/png")
        for kind, owned in ((PageKind.STREAMING, "clips"), (PageKind.PRESS, "appearances")):
            page = self.pages[kind]
            entry = ContentEntry.objects.create(page=page, title="Entry", eyebrow="Context", description="Summary", asset=asset,
                                                alt_text="Artwork", action_label="Read", action_url="https://example.invalid", is_featured=True)
            ContentEntryMetadata.objects.create(entry=entry, key="outlet", label="Publication", value="Outlet")
            if kind == PageKind.STREAMING:
                StreamClip.objects.create(page=page, eyebrow="Game", title="Clip", category="Highlights", action_label="Play", action_url="https://example.invalid/clip")
            else:
                Appearance.objects.create(page=page, year="2026", title="Panel", format="Panel", url=None)
            with self.assertNumQueries(8):
                response = self.client.get(f"/api/pages/{page.pk}/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["feature"]["item_id"], entry.pk)
            self.assertEqual(response.json()["entries"][0]["id"], entry.pk)
            self.assertEqual(len(response.json()[owned]), 1)

    def test_bio_aggregate_keeps_authored_chapters_and_current_work_separate(self):
        page = self.pages[PageKind.BIO]
        chapter = BioChapter.objects.create(page=page, eyebrow="Early years", heading="The beginning", body="Story")
        item = CurrentItem.objects.create(page=page, eyebrow="Music", title="Practice", description="Notes", link_label=None, link_url=None)
        with self.assertNumQueries(7):
            response = self.client.get(f"/api/pages/{page.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["chapters"][0]["id"], chapter.pk)
        self.assertEqual(response.json()["current_items"][0]["id"], item.pk)
        self.assertIsNone(response.json()["current_items"][0]["link"])
        self.assertNotIn("links", response.json())

    def test_collection_mutations_require_authentication(self):
        for endpoint, collection, kind, model, fields, _ in self.cases:
            item = self.send("post", f"/api/{endpoint}/", {"page_id": self.pages[kind].pk, **fields}).json()
            for method, url in (("post", f"/api/{endpoint}/"), ("patch", f"/api/{endpoint}/{item['id']}/"), ("delete", f"/api/{endpoint}/{item['id']}/")):
                with self.subTest(collection=collection, method=method):
                    self.assertEqual(getattr(self.client, method)(url, data={}, content_type="application/json").status_code, 403)
