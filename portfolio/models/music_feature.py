from django.db import models

from .media_asset import MediaAsset
from .page import Page


class MusicFeature(models.Model):
    page = models.OneToOneField(Page, on_delete=models.CASCADE, related_name="music_feature")
    eyebrow = models.CharField(max_length=300)
    title = models.CharField(max_length=300)
    description = models.TextField()
    asset = models.ForeignKey(MediaAsset, on_delete=models.PROTECT, related_name="practice_uses")
    alt_text = models.CharField(max_length=2000)
    caption = models.TextField(blank=True)
    action_label = models.CharField(max_length=200)
    action_url = models.URLField(max_length=2000)


class PracticeFact(models.Model):
    feature = models.ForeignKey(MusicFeature, on_delete=models.CASCADE, related_name="facts")
    label = models.CharField(max_length=200)
    value = models.CharField(max_length=500)
    sort_order = models.PositiveIntegerField()

    class Meta:
        ordering = ("sort_order", "id")
