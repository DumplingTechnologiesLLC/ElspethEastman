from django.db import migrations


# Frozen renderer identities: display text and addresses may be edited later.
PAGES = (
    ("home", "Elspeth Eastman", ""),
    ("voiceover", "Voiceover", "voiceover"),
    ("music", "Music", "music"),
    ("streaming", "Streaming", "streaming"),
    ("press", "Press", "press"),
    ("bio", "Bio", "bio"),
)


def seed_pages(apps, schema_editor):
    Page = apps.get_model("portfolio", "Page")
    for kind, title, slug in PAGES:
        Page.objects.using(schema_editor.connection.alias).get_or_create(
            kind=kind, defaults={"title": title, "slug": slug}
        )


class Migration(migrations.Migration):
    dependencies = [("portfolio", "0001_page_content_ownership")]
    operations = [migrations.RunPython(seed_pages, migrations.RunPython.noop)]
