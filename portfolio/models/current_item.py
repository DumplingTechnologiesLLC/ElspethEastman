from django.db import models

from .page import Page


class CurrentItem(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="current_items")
    eyebrow = models.CharField(max_length=300)
    title = models.CharField(max_length=300)
    description = models.TextField()
    link_label = models.CharField(max_length=200, null=True)
    link_url = models.URLField(max_length=2000, null=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [models.CheckConstraint(
            condition=(models.Q(link_label__isnull=True, link_url__isnull=True)
                       | (models.Q(link_label__isnull=False, link_url__isnull=False) & ~models.Q(link_label="") & ~models.Q(link_url=""))),
            name="portfolio_current_complete_link",
        )]
