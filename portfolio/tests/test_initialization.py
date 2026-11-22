from importlib import import_module
from pathlib import Path
from types import SimpleNamespace

from django.apps import apps
from django.contrib.staticfiles import finders
from django.db import connection
from django.test import TestCase
from PIL import Image

from core.models import Experience, Project, Skills
from portfolio.models import ContentEntry, Eyebrow, MediaAsset, MusicFeature, MusicRelease, Page, PageCopy, PageImage, PageKind
from portfolio.tests.base import EmptyPortfolioTestCase


seed = import_module("portfolio.migrations.0006_seed_renderer_defaults")


class StartupContentTests(TestCase):
    def test_migrations_initialize_every_public_aggregate_without_upload_storage(self):
        self.assertEqual(Page.objects.count(), 6)
        for page in Page.objects.all():
            with self.subTest(kind=page.kind):
                response = self.client.get(f"/api/v2/pages/{page.public_id}/")
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.json()["copy"])
        feature = MusicFeature.objects.get()
        self.assertEqual(feature.action_url, seed.YOUTUBE)
        self.assertEqual(feature.facts.count(), 0)
        self.assertFalse(Page.objects.exclude(primary_action_url=None).exists())


class SeedPreservationTests(EmptyPortfolioTestCase):
    def initialize(self):
        seed.seed_defaults(apps, SimpleNamespace(connection=connection))

    def test_bundled_assets_exist_with_the_frozen_dimensions_and_approved_album_sources(self):
        Skills.objects.all().delete()
        self.initialize()
        for asset in MediaAsset.objects.all():
            with self.subTest(asset=asset.file.name):
                static_name = "portfolio/" + asset.file.name.removeprefix("seed/")
                file = Path(finders.find(static_name))
                self.assertGreater(file.stat().st_size, 0)
                with Image.open(file) as image:
                    self.assertEqual(image.size, (asset.width, asset.height))
                    self.assertEqual(Image.MIME[image.format], asset.mime_type)
        self.assertEqual(ContentEntry.objects.count(), 2)
        self.assertEqual(MusicRelease.objects.count(), 3)
        self.assertTrue(all(url.startswith("https://elspetheastman.bandcamp.com/album/")
                            for url in MusicRelease.objects.values_list("action_url", flat=True)))
        self.assertFalse(MusicRelease.objects.exclude(artwork_title="").exists())

    def test_repeated_initialization_preserves_edits_ids_order_and_collection_membership(self):
        self.initialize()
        home, music, voice = (Page.objects.get(kind=kind) for kind in (PageKind.HOME, PageKind.MUSIC, PageKind.VOICEOVER))
        PageCopy.objects.filter(page=home, key="intro-headline").update(value="Client headline")
        PageImage.objects.filter(page=home, key="hero").update(alt_text="Client alt text")
        MusicFeature.objects.filter(page=music).update(title="Client practice")
        Eyebrow.objects.filter(page=home).update(label="Client identity")
        ContentEntry.objects.filter(page=voice).delete()
        entry = ContentEntry.objects.create(page=voice, title="Client role", eyebrow="Studio", description="Client summary")
        release = MusicRelease.objects.first()
        MusicRelease.objects.exclude(pk=release.pk).delete()
        release.action_url = "https://example.invalid/client-album"
        release.sort_order = 7
        release.save()
        before = {name: list(apps.get_model("portfolio", name).objects.values()) for name in
                  ("Page", "PageCopy", "PageImage", "MusicFeature", "Eyebrow", "ContentEntry", "MusicRelease", "MediaAsset")}
        self.initialize()
        self.initialize()
        after = {name: list(apps.get_model("portfolio", name).objects.values()) for name in before}
        self.assertEqual(before, after)
        self.assertEqual(ContentEntry.objects.get().pk, entry.pk)

    def test_existing_authored_skill_copy_is_reused_without_deleting_legacy_data(self):
        Skills.objects.all().delete()
        legacy = Skills.objects.create(voice_acting="Client voice copy", game_development="", streaming="Client stream copy")
        credit = Experience.objects.create(category=Experience.VOICE_CREDITS, credit="Ambiguous historical credit", year=2014)
        project = Project.objects.create(title="Historical video", src="source-id")
        self.initialize()
        for kind, text in ((PageKind.VOICEOVER, legacy.voice_acting), (PageKind.STREAMING, legacy.streaming),
                           (PageKind.MUSIC, seed.INTRO["music"][2])):
            self.assertEqual(PageCopy.objects.get(page__kind=kind, key="intro-body").value, text)
        self.assertEqual(Experience.objects.get(pk=credit.pk).credit, credit.credit)
        self.assertEqual(Project.objects.get(pk=project.pk).src, project.src)
        self.assertEqual(Skills.objects.get(pk=legacy.pk).voice_acting, legacy.voice_acting)
