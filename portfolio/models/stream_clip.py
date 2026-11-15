from django.db import models

from .page import Page


class StreamClip(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="clips")
    eyebrow = models.CharField(max_length=300)
    title = models.CharField(max_length=300)
    category = models.CharField(max_length=200)
    action_label = models.CharField(max_length=200)
    action_url = models.URLField(max_length=2000)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
