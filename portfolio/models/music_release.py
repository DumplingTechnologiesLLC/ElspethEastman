import uuid
from django.db import models

from .media_asset import MediaAsset
from .page import Page


class MusicRelease(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="releases")
    year = models.CharField(max_length=20, blank=True)
    format = models.CharField(max_length=200)
    title = models.CharField(max_length=300)
    description = models.TextField()
    asset = models.ForeignKey(MediaAsset, on_delete=models.PROTECT, related_name="release_uses")
    alt_text = models.CharField(max_length=2000)
    caption = models.TextField(blank=True)
    artwork_title = models.CharField(max_length=300, blank=True)
    action_label = models.CharField(max_length=200)
    action_url = models.URLField(max_length=2000)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
