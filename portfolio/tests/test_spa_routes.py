from django.test import TestCase

from portfolio.models import Page, PageKind


class RegisteredPageRouteTests(TestCase):
    def test_registered_public_and_cms_paths_serve_the_application_on_fresh_loads(self):
        for slug in Page.objects.exclude(kind=PageKind.HOME).values_list("slug", flat=True):
            for prefix in ("", "/cms"):
                for suffix in ("", "/"):
                    with self.subTest(slug=slug, prefix=prefix, suffix=suffix):
                        response = self.client.get(f"{prefix}/{slug}{suffix}?entry=40")
                        self.assertContains(response, '<div id="root">')

    def test_renames_expose_only_current_addresses_and_keep_reserved_paths_separate(self):
        Page.objects.filter(kind=PageKind.VOICEOVER).update(slug="characters")
        for path in ("/characters", "/cms/characters"):
            self.assertContains(self.client.get(path), '<div id="root">')
        for path in ("/voiceover", "/cms/voiceover", "/unknown", "/cms/unknown", "/api/not-an-endpoint/"):
            self.assertEqual(self.client.get(path).status_code, 404)
