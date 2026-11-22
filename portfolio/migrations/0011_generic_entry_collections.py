"""Preserve link-card identities while consolidating their shared storage."""
from django.db import migrations, models

COLLECTIONS = (("StreamClip", "stream_clips"), ("CurrentItem", "current_items"))


def consolidate(apps, schema_editor):
    alias = schema_editor.connection.alias
    Entry = apps.get_model("portfolio", "ContentEntry")
    for name, collection in COLLECTIONS:
        Source = apps.get_model("portfolio", name)
        for row in Source.objects.using(alias).all().iterator():
            values = {field: getattr(row, field) for field in ("public_id", "page_id", "eyebrow", "title", "sort_order")}
            if name == "StreamClip":
                values.update(category=row.category, action_label=row.action_label, action_url=row.action_url)
            else:
                values.update(description=row.description, action_label=row.link_label, action_url=row.link_url)
            Entry.objects.using(alias).create(collection=collection, **values)


def restore(apps, schema_editor):
    alias = schema_editor.connection.alias
    Entry = apps.get_model("portfolio", "ContentEntry")
    for name, collection in COLLECTIONS:
        Target = apps.get_model("portfolio", name)
        for row in Entry.objects.using(alias).filter(collection=collection).iterator():
            values = {field: getattr(row, field) for field in ("public_id", "page_id", "eyebrow", "title", "sort_order")}
            if name == "StreamClip":
                values.update(category=row.category, action_label=row.action_label, action_url=row.action_url)
            else:
                values.update(description=row.description, link_label=row.action_label, link_url=row.action_url)
            Target.objects.using(alias).create(**values)
        Entry.objects.using(alias).filter(collection=collection).delete()


class Migration(migrations.Migration):
    dependencies = [("portfolio", "0010_collection_public_identifiers")]
    operations = [
        migrations.AddField(model_name="contententry", name="collection", field=models.SlugField(max_length=100, default="entries", db_index=True)),
        migrations.RunPython(consolidate, restore),
        migrations.DeleteModel(name="StreamClip"),
        migrations.DeleteModel(name="CurrentItem"),
        migrations.AddConstraint(model_name="contententry", constraint=models.CheckConstraint(condition=models.Q(is_featured=False) | models.Q(collection="entries"), name="portfolio_only_entries_featured")),
    ]
