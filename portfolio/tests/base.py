from importlib import import_module
from types import SimpleNamespace

from django.apps import apps
from django.db import connection
from django.test import TestCase

from portfolio.models import MediaAsset, Page


class EmptyPortfolioTestCase(TestCase):
    """Give API contract tests empty collections independent of public seed copy."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        Page.objects.all().delete()
        MediaAsset.objects.all().delete()
        import_module("portfolio.migrations.0002_seed_page_identities").seed_pages(
            apps, SimpleNamespace(connection=connection)
        )
