import uuid
from django.db import models
from .page import Page
from .media_asset import MediaAsset


class PageImage(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="images")
    key = models.SlugField(max_length=100)
    asset = models.ForeignKey(MediaAsset, on_delete=models.PROTECT, related_name="page_uses")
    alt_text = models.CharField(max_length=2000)
    caption = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("page", "key"), name="portfolio_image_page_key"),
            models.CheckConstraint(condition=~models.Q(alt_text=""), name="portfolio_image_alt_text"),
        ]
