import uuid
from django.db import models

from .page import Page


class Appearance(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="appearances")
    year = models.CharField(max_length=20)
    title = models.CharField(max_length=300)
    format = models.CharField(max_length=200)
    url = models.URLField(max_length=2000, null=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
