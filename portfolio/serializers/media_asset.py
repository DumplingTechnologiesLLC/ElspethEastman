from django.conf import settings
from rest_framework import serializers
from portfolio.models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ("id", "url", "width", "height", "mime_type", "credit", "source_url", "created_at")

    def get_url(self, asset):
        # Seeded artwork ships with the application; uploads use configured storage.
        if asset.file.name.startswith("seed/"):
            return f"{settings.STATIC_URL}redesign/{asset.file.name.removeprefix('seed/')}"
        return asset.file.url
