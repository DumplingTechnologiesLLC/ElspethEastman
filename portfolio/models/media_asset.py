from django.db import models


class MediaMime(models.TextChoices):
    JPEG = "image/jpeg", "JPEG"
    PNG = "image/png", "PNG"
    WEBP = "image/webp", "WebP"


class MediaAsset(models.Model):
    file = models.FileField(upload_to="uploads/", max_length=300)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=20, choices=MediaMime.choices)
    credit = models.CharField(max_length=500, blank=True)
    source_url = models.URLField(max_length=2000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(width__gt=0, height__gt=0), name="portfolio_asset_dimensions"),
            models.CheckConstraint(condition=models.Q(mime_type__in=MediaMime.values), name="portfolio_asset_mime"),
        ]
