import uuid
from django.db import models

from .media_asset import MediaAsset
from .page import Page


class ContentEntry(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    collection = models.SlugField(max_length=100, default="entries", db_index=True)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="entries")
    title = models.CharField(max_length=300)
    eyebrow = models.CharField(max_length=300)
    description = models.TextField()
    asset = models.ForeignKey(MediaAsset, on_delete=models.PROTECT, related_name="entry_uses", null=True)
    alt_text = models.CharField(max_length=2000, blank=True)
    caption = models.TextField(blank=True)
    action_label = models.CharField(max_length=200, null=True)
    action_url = models.URLField(max_length=2000, null=True)
    category = models.CharField(max_length=200, null=True)
    published_at = models.DateTimeField(null=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.CheckConstraint(condition=models.Q(is_featured=False) | models.Q(collection="entries"), name="portfolio_only_entries_featured"),
            models.UniqueConstraint(fields=("page",), condition=models.Q(is_featured=True), name="portfolio_one_feature_per_page"),
            models.CheckConstraint(condition=models.Q(is_featured=False) | models.Q(asset__isnull=False), name="portfolio_feature_requires_image"),
            models.CheckConstraint(condition=models.Q(asset__isnull=True) | ~models.Q(alt_text=""), name="portfolio_entry_image_alt"),
            models.CheckConstraint(condition=(models.Q(action_label__isnull=True, action_url__isnull=True)
                | (models.Q(action_label__isnull=False, action_url__isnull=False) & ~models.Q(action_label="") & ~models.Q(action_url=""))),
                name="portfolio_entry_complete_action"),
        ]


class ContentEntryMetadata(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    entry = models.ForeignKey(ContentEntry, on_delete=models.CASCADE, related_name="metadata")
    key = models.SlugField(max_length=100)
    label = models.CharField(max_length=200)
    value = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [models.UniqueConstraint(fields=("entry", "key"), name="portfolio_metadata_entry_key")]
