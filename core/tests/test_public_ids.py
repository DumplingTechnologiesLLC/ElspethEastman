"""Verify public identity upgrades against an independent historical database."""
from importlib import import_module
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from uuid import UUID

from django.db import connections
from django.db.backends.sqlite3.base import DatabaseWrapper
from django.db.migrations.executor import MigrationExecutor
from django.db.utils import ConnectionHandler
from django.test import SimpleTestCase, override_settings
from django.utils import timezone


class PublicIdentityUpgradeTests(SimpleTestCase):
    def test_backfill_preserves_legacy_content_keys_relationships_and_order(self):
        with TemporaryDirectory(prefix='elspeth-uuid-upgrade-') as directory:
            alias = 'public-identity-upgrade'
            config = ConnectionHandler({'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': str(Path(directory) / 'upgrade.sqlite3'),
            }}).settings['default']
            connection = DatabaseWrapper(config, alias=alias)
            connections[alias] = connection
            routing = override_settings(DATABASE_ROUTERS=[SimpleNamespace(
                db_for_read=lambda *args, **kwargs: alias,
                db_for_write=lambda *args, **kwargs: alias,
            )])
            routing.enable()
            try:
                executor = MigrationExecutor(connection)
                before = [('core', '0008_project_uuid'), ('portfolio', '0002_seed_page_identities')]
                executor.migrate(before)
                apps = executor.loader.project_state(before).apps
                core = {
                    'Contact': {'name': 'Preserved', 'email': 'client@example.invalid', 'message': 'Message', 'date_created': timezone.now()},
                    'Experience': {'credit': 'Preserved', 'category': 'Voice Credits', 'year': 2021},
                    'FooterStat': {'value': '10', 'label': 'Preserved', 'percent': 10},
                    'Affiliations': {'affiliation': 'Preserved', 'link': 'https://example.invalid'},
                    'Project': {'title': 'Preserved', 'src': 'video', 'uuid': 31},
                    'Skills': {'game_development': 'Games', 'streaming': 'Streams', 'voice_acting': 'Voice'},
                }
                for name, values in core.items():
                    model = apps.get_model('core', name)
                    model.objects.using(alias).create(**values)
                    model.objects.using(alias).create(**values)
                page = apps.get_model('portfolio', 'Page').objects.using(alias).get(kind='bio')
                asset = apps.get_model('portfolio', 'MediaAsset').objects.using(alias).create(
                    file='seed/preserved.png', width=800, height=900, mime_type='image/png', credit='Preserved',
                )
                shared = {
                    'PageCopy': {'page_id': page.pk, 'key': 'preserved', 'section': 'intro', 'kind': 'body', 'value': 'Preserved', 'sort_order': 7},
                    'PageImage': {'page_id': page.pk, 'key': 'portrait', 'asset_id': asset.pk, 'alt_text': 'Preserved'},
                    'Eyebrow': {'page_id': page.pk, 'label': 'Preserved', 'sort_order': 4},
                    'TriviaItem': {'page_id': page.pk, 'label': 'Preserved', 'value': 'Value', 'sort_order': 2},
                }
                for name, values in shared.items():
                    apps.get_model('portfolio', name).objects.using(alias).create(**values)
                names = [('core', name) for name in core] + [('portfolio', name) for name in ['Page', 'MediaAsset', *shared]]
                snapshots = {
                    (app, name): list(apps.get_model(app, name).objects.using(alias).order_by('pk').values())
                    for app, name in names
                }
                after = [('core', '0009_public_identifiers'), ('portfolio', '0007_shared_public_identifiers')]
                executor = MigrationExecutor(connection)
                executor.migrate(after)
                upgraded = executor.loader.project_state(after).apps
                for (app, name), rows in snapshots.items():
                    model = upgraded.get_model(app, name)
                    ids = []
                    for row in rows:
                        record = model.objects.using(alias).get(pk=row['id'])
                        self.assertIsInstance(record.pk, int)
                        self.assertIsInstance(record.public_id, UUID)
                        self.assertEqual(record.public_id.version, 4)
                        self.assertEqual({key: getattr(record, key) for key in row}, row)
                        ids.append(record.public_id)
                    self.assertEqual(len(set(ids)), len(rows))
                identities = {
                    (app, name): list(upgraded.get_model(app, name).objects.using(alias).order_by('pk').values_list('public_id', flat=True))
                    for app, name in names
                }
                for app, migration in after:
                    import_module(f'{app}.migrations.{migration}').assign_public_ids(upgraded, SimpleNamespace(connection=connection))
                for (app, name), ids in identities.items():
                    self.assertEqual(list(upgraded.get_model(app, name).objects.using(alias).order_by('pk').values_list('public_id', flat=True)), ids)
            finally:
                routing.disable()
                connection.close()
                del connections[alias]
