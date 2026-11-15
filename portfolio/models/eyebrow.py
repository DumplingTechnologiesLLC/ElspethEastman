from django.db import models
from .page import Page


class Eyebrow(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="eyebrows")
    label = models.CharField(max_length=200)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
