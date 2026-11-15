from django.db import models

from .page import Page


class BioChapter(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="chapters")
    eyebrow = models.CharField(max_length=300)
    heading = models.CharField(max_length=300)
    body = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
