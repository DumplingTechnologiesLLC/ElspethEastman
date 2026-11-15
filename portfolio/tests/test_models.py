from importlib import import_module
from types import SimpleNamespace

from django.apps import apps
from django.db import IntegrityError, connection, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from portfolio.models import (
    Eyebrow, MediaAsset, Page, PageCopy, PageImage, PageKind, TriviaItem,
)


class PageIdentityTests(TestCase):
    def test_seeding_preserves_identity_and_editor_changes(self):
        page = Page.objects.get(kind=PageKind.MUSIC)
        original_id = page.pk
        page.title = "Composition"
        page.slug = "composition"
        page.save()
        seed = import_module("portfolio.migrations.0002_seed_page_identities").seed_pages
        editor = SimpleNamespace(connection=connection)
        seed(apps, editor)
        seed(apps, editor)
        page.refresh_from_db()
        self.assertEqual((page.pk, page.kind, page.title, page.slug),
                         (original_id, PageKind.MUSIC, "Composition", "composition"))
        self.assertEqual(set(Page.objects.values_list("kind", flat=True)), set(PageKind.values))

    def test_seeding_restores_only_missing_renderer_identities(self):
        Page.objects.get(kind=PageKind.BIO).delete()
        seed = import_module("portfolio.migrations.0002_seed_page_identities").seed_pages
        seed(apps, SimpleNamespace(connection=connection))
        self.assertEqual(Page.objects.filter(kind=PageKind.BIO).count(), 1)

    def test_database_rejects_duplicate_renderer_and_addresses(self):
        for changes in ({"slug": "voiceover"}, {"kind": PageKind.VOICEOVER}):
            with self.subTest(changes=changes), self.assertRaises(IntegrityError), transaction.atomic():
                Page.objects.filter(kind=PageKind.BIO).update(**changes)

    def test_database_reserves_the_empty_slug_for_home(self):
        for kind, slug in ((PageKind.HOME, "home"), (PageKind.BIO, "")):
            with self.subTest(kind=kind), self.assertRaises(IntegrityError), transaction.atomic():
                Page.objects.filter(kind=kind).update(slug=slug)

    def test_database_rejects_unknown_renderer_kinds(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Page.objects.filter(kind=PageKind.BIO).update(kind="arbitrary")

    def test_external_page_action_remains_a_complete_optional_value(self):
        page = Page.objects.get(kind=PageKind.VOICEOVER)
        for label, url in (("Play reel", None), (None, "https://example.invalid/reel"),
                           ("", "https://example.invalid/reel"), ("Play reel", "")):
            with self.subTest(label=label, url=url), self.assertRaises(IntegrityError), transaction.atomic():
                Page.objects.filter(pk=page.pk).update(primary_action_label=label, primary_action_url=url)
        page.primary_action_label = "Play reel"
        page.primary_action_url = "https://example.invalid/reel"
        page.save()
        page.primary_action_label = page.primary_action_url = None
        page.save()
        page.refresh_from_db()
        self.assertIsNone(page.primary_action_url)


class SharedContentOwnershipTests(TestCase):
    def setUp(self):
        self.home = Page.objects.get(kind=PageKind.HOME)
        self.bio = Page.objects.get(kind=PageKind.BIO)
        self.asset = MediaAsset.objects.create(file="seed/portrait.png", width=800, height=900,
                                              mime_type="image/png")

    def test_copy_keys_are_scoped_to_the_page_and_independent_of_display_text(self):
        first = PageCopy.objects.create(page=self.home, key="intro-1", section="intro", kind="body",
                                        value="A paragraph", sort_order=1)
        first.value = "Renamed paragraph"
        first.save()
        other = PageCopy.objects.create(page=self.bio, key="intro-1", section="intro", kind="body",
                                       value="Another page")
        self.assertNotEqual(first.pk, other.pk)
        with self.assertRaises(IntegrityError), transaction.atomic():
            PageCopy.objects.create(page=self.home, key="intro-1", section="short_bio", kind="body", value="Duplicate")
        with self.assertRaises(IntegrityError), transaction.atomic():
            PageCopy.objects.filter(pk=first.pk).update(kind="html")

    def test_manual_order_is_stable_and_rejects_negative_positions(self):
        for model, fields in ((PageCopy, {"key": "later", "section": "intro", "kind": "body", "value": "Later"}),
                              (Eyebrow, {"label": "Later"}),
                              (TriviaItem, {"label": "Later", "value": "Later"})):
            with self.subTest(model=model.__name__):
                later = model.objects.create(page=self.home, sort_order=2, **fields)
                earlier_fields = {**fields, "key": "earlier"} if model is PageCopy else fields
                earlier = model.objects.create(page=self.home, sort_order=0, **earlier_fields)
                self.assertEqual(list(model.objects.filter(page=self.home)), [earlier, later])
                with self.assertRaises(IntegrityError), transaction.atomic():
                    model.objects.filter(pk=earlier.pk).update(sort_order=-1)

    def test_image_keys_and_alt_text_belong_to_the_use_not_the_asset(self):
        first = PageImage.objects.create(page=self.home, key="hero", asset=self.asset, alt_text="Elspeth smiling")
        other = PageImage.objects.create(page=self.bio, key="portrait", asset=self.asset, alt_text="Elspeth in her studio")
        self.assertEqual(first.asset_id, other.asset_id)
        self.assertNotEqual(first.alt_text, other.alt_text)
        with self.assertRaises(IntegrityError), transaction.atomic():
            PageImage.objects.create(page=self.home, key="hero", asset=self.asset, alt_text="Duplicate")
        with self.assertRaises(IntegrityError), transaction.atomic():
            PageImage.objects.filter(pk=first.pk).update(alt_text="")
        with self.assertRaises(ProtectedError):
            self.asset.delete()

    def test_deleting_an_owner_cascades_content_and_preserves_reusable_media(self):
        copy = PageCopy.objects.create(page=self.bio, key="intro", section="intro", kind="body", value="Bio")
        image = PageImage.objects.create(page=self.bio, key="portrait", asset=self.asset, alt_text="Portrait")
        label = Eyebrow.objects.create(page=self.bio, label="Voice actor")
        fact = TriviaItem.objects.create(page=self.bio, label="Started", value="2012")
        self.bio.delete()
        for record in (copy, image, label, fact):
            self.assertFalse(type(record).objects.filter(pk=record.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=self.asset.pk).exists())

    def test_media_records_require_supported_formats_and_real_dimensions(self):
        for changes in ({"width": 0}, {"height": 0}, {"mime_type": "image/svg+xml"}):
            with self.subTest(changes=changes), self.assertRaises(IntegrityError), transaction.atomic():
                MediaAsset.objects.filter(pk=self.asset.pk).update(**changes)
