from django.db import models
from .page import Page


class TriviaItem(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="trivia")
    label = models.CharField(max_length=200)
    value = models.CharField(max_length=500)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
