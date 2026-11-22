"""Join frozen first-run content with the public identity and collection upgrades."""
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portfolio", "0006_seed_renderer_defaults"),
        ("portfolio", "0011_generic_entry_collections"),
    ]
    operations = []
