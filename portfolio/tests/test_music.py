from unittest.mock import patch

from django.contrib.auth import get_user_model
from portfolio.tests.base import EmptyPortfolioTestCase as TestCase
from rest_framework.authtoken.models import Token

from portfolio.models import MediaAsset, MusicFeature, MusicRelease, Page, PageKind, PracticeFact


class MusicContentTests(TestCase):
    def setUp(self):
        self.music = Page.objects.get(kind=PageKind.MUSIC)
        self.voice = Page.objects.get(kind=PageKind.VOICEOVER)
        self.asset = MediaAsset.objects.create(file="seed/cello.png", width=800, height=900, mime_type="image/png")
        self.feature = MusicFeature.objects.create(page=self.music, eyebrow="Practice", title="Cello", description="Practice notes",
                                                    asset=self.asset, alt_text="Cello practice", action_label="Watch", action_url="https://example.invalid/watch")
        self.fact = PracticeFact.objects.create(feature=self.feature, label="Current study", value="Etude", sort_order=0)
        token = Token.objects.create(user=get_user_model().objects.create_user("music-editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}
        self.feature_input = {"page_id": self.music.pk, "eyebrow": "In progress", "title": "Cello practice", "description": "New notes",
                              "image": {"asset_id": self.asset.pk, "alt_text": "Elspeth with a cello", "caption": "Practice"},
                              "facts": [{"label": "Current study", "value": "New study"}, {"label": "Focus", "value": "Bowing"}],
                              "action": {"label": "Watch progress", "url": "https://example.invalid/progress"}}
        self.release_input = {"page_id": self.music.pk, "year": "2014", "format": "Album", "title": "Original music",
                              "description": "A collection of songs", "artwork": self.feature_input["image"], "artwork_title": "Original music",
                              "action": {"label": "Listen", "url": "https://example.invalid/album"}}

    def send(self, method, endpoint, data=None):
        return getattr(self.client, method)(endpoint, data=data, content_type="application/json", **self.headers)

    def create_release(self, **changes):
        response = self.send("post", "/api/music-releases/", {**self.release_input, **changes})
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()

    def test_practice_update_replaces_the_singleton_and_its_ordered_facts(self):
        response = self.send("patch", "/api/music-features/", self.feature_input)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["facts"], self.feature_input["facts"])
        self.assertEqual(response.json()["image"]["alt_text"], "Elspeth with a cello")
        self.assertEqual(response.json()["action"], {"label": "Watch progress", "href": "https://example.invalid/progress", "is_external": True})
        self.assertEqual(MusicFeature.objects.get(page=self.music).pk, self.feature.pk)
        self.assertEqual(MusicFeature.objects.count(), 1)
        empty = self.send("patch", "/api/music-features/", {**self.feature_input, "facts": []})
        self.assertEqual(empty.json()["facts"], [])

    def test_practice_requires_complete_input_supported_owner_and_existing_setup(self):
        too_many = {**self.feature_input, "facts": self.feature_input["facts"] + [{"label": "Extra", "value": "Extra"}]}
        for data, field in ((too_many, "facts.non_field_errors"), ({"page_id": self.music.pk}, "title"),
                            ({**self.feature_input, "page_id": self.voice.pk}, "page_id"),
                            ({**self.feature_input, "image": None}, "image"),
                            ({**self.feature_input, "facts": [{"label": "Fact"}]}, "facts.0.value"),
                            ({**self.feature_input, "facts": [{"id": 99, "label": "Fact", "value": "Value"}]}, "facts.0.id")):
            with self.subTest(field=field):
                response = self.send("patch", "/api/music-features/", data)
                self.assertEqual(response.status_code, 400, response.content)
                self.assertIn(field, response.json()["fields"])
        MusicFeature.objects.filter(pk=self.feature.pk).delete()
        self.assertEqual(self.send("patch", "/api/music-features/", self.feature_input).status_code, 404)
        response = self.client.get(f"/api/pages/{self.music.pk}/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Music practice is not configured."})

    def test_failed_fact_write_rolls_back_practice_values_and_previous_facts(self):
        with patch.object(PracticeFact.objects, "bulk_create", side_effect=RuntimeError("Fact write interrupted")):
            with self.assertRaisesMessage(RuntimeError, "Fact write interrupted"):
                self.send("patch", "/api/music-features/", self.feature_input)
        self.feature.refresh_from_db()
        self.assertEqual(self.feature.title, "Cello")
        self.assertEqual(list(self.feature.facts.values_list("label", "value")), [("Current study", "Etude")])

    def test_release_create_partial_edit_and_delete_preserve_independent_identity(self):
        first = self.create_release()
        second = self.create_release(title="Another release", year="", artwork_title="")
        self.assertEqual(second["sort_order"], 1)
        self.assertEqual(second["year"], "")
        self.assertEqual(second["artwork_title"], "")
        endpoint = f"/api/music-releases/{first['id']}/"
        response = self.send("patch", endpoint, {"title": "Renamed"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], first["id"])
        self.assertEqual(response.json()["artwork"], first["artwork"])
        self.assertEqual(response.json()["action"], first["action"])
        changed = self.send("patch", endpoint, {"artwork": {**self.release_input["artwork"], "alt_text": "New context"},
                                                 "action": {"label": "Buy", "url": "https://example.invalid/buy"}})
        self.assertEqual(changed.json()["artwork"]["alt_text"], "New context")
        self.assertEqual(changed.json()["action"]["label"], "Buy")
        deleted = self.send("delete", endpoint)
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(deleted.content, b"")
        self.assertTrue(MusicFeature.objects.filter(pk=self.feature.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=self.asset.pk).exists())
        self.assertEqual(self.send("patch", endpoint, {}).status_code, 404)
        self.assertEqual(self.send("delete", endpoint).status_code, 404)

    def test_release_validation_prevents_ownership_changes_and_incomplete_artwork(self):
        release = self.create_release()
        endpoint = f"/api/music-releases/{release['id']}/"
        for data, field in (({"page_id": self.voice.pk}, "page_id"), ({"sort_order": 99}, "sort_order"),
                            ({"artwork": {"asset_id": self.asset.pk}}, "artwork.alt_text"),
                            ({"action": None}, "action"), ({"is_featured": True}, "is_featured")):
            with self.subTest(data=data):
                response = self.send("patch", endpoint, data)
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()["fields"])
        self.assertEqual(self.send("post", "/api/music-releases/", {**self.release_input, "page_id": self.voice.pk}).status_code, 400)
        self.assertEqual(self.send("post", "/api/music-releases/", {**self.release_input, "artwork": {**self.release_input["artwork"], "asset_id": 999999}}).status_code, 404)

    def test_release_reorder_never_changes_the_practice_feature_and_cannot_promote_releases(self):
        first, second = self.create_release(), self.create_release(title="Second")
        body = {"page_id": self.music.pk, "collection": "releases", "section": None, "ordered_ids": [second["id"], first["id"]]}
        self.assertEqual(self.send("patch", "/api/collections/reorder/", body).status_code, 200)
        self.assertEqual(list(self.music.releases.values_list("id", flat=True)), [second["id"], first["id"]])
        self.assertEqual(self.send("patch", "/api/collections/reorder/", {**body, "page_id": self.voice.pk, "ordered_ids": []}).status_code, 400)
        self.assertEqual(self.send("patch", "/api/featured-items/", {"page_id": self.music.pk, "item_id": first["id"]}).status_code, 400)
        self.feature.refresh_from_db()
        self.assertEqual(self.feature.title, "Cello")

    def test_music_aggregate_keeps_practice_and_ordered_releases_separate_without_extra_queries(self):
        first, second = self.create_release(), self.create_release(title="Second")
        with self.assertNumQueries(8):
            response = self.client.get(f"/api/pages/{self.music.pk}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["feature"]["title"], "Cello")
        self.assertEqual(response.json()["feature"]["facts"], [{"label": "Current study", "value": "Etude"}])
        self.assertEqual([row["id"] for row in response.json()["releases"]], [first["id"], second["id"]])

    def test_music_mutations_require_authentication(self):
        release = self.create_release()
        for method, endpoint in (("patch", "/api/music-features/"), ("post", "/api/music-releases/"),
                                  ("patch", f"/api/music-releases/{release['id']}/"), ("delete", f"/api/music-releases/{release['id']}/")):
            with self.subTest(method=method, endpoint=endpoint):
                self.assertEqual(getattr(self.client, method)(endpoint, data={}, content_type="application/json").status_code, 403)
