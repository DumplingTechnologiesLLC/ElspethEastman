"""Backfill opaque public identities while retaining integer database keys."""
import uuid
from django.db import migrations, models

MODELS = ('Contact', 'Experience', 'FooterStat', 'Affiliations', 'Project', 'Skills')


def assign_public_ids(apps, schema_editor):
    alias = schema_editor.connection.alias
    for name in MODELS:
        model = apps.get_model('core', name)
        for record in model.objects.using(alias).filter(public_id__isnull=True).iterator():
            record.public_id = uuid.uuid4()
            record.save(using=alias, update_fields=["public_id"])


class Migration(migrations.Migration):
    dependencies = [('core', '0008_project_uuid')]
    operations = [
        *[migrations.AddField(model_name=name.lower(), name="public_id", field=models.UUIDField(null=True, editable=False)) for name in MODELS],
        migrations.RunPython(assign_public_ids, migrations.RunPython.noop),
        *[migrations.AlterField(model_name=name.lower(), name="public_id", field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False)) for name in MODELS],
    ]
