from django.db import models
from .page import Page


class CopyKind(models.TextChoices):
    HEADLINE = "headline", "Headline"
    SUBHEADLINE = "subheadline", "Subheadline"
    BODY = "body", "Body"
    SECTION_LABEL = "section_label", "Section label"


class PageCopy(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="copy")
    key = models.SlugField(max_length=100)
    section = models.SlugField(max_length=100)
    kind = models.CharField(max_length=20, choices=CopyKind.choices)
    value = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(fields=("page", "key"), name="portfolio_copy_page_key"),
            models.CheckConstraint(condition=models.Q(kind__in=CopyKind.values), name="portfolio_copy_known_kind"),
        ]
