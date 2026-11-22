from rest_framework import serializers
from portfolio.models import PageImage
from .media_asset import MediaAssetSerializer


class ImageUseSerializer(serializers.Serializer):
    asset = MediaAssetSerializer()
    alt_text = serializers.CharField()
    caption = serializers.CharField()


class PageImageSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    image = ImageUseSerializer(source="*")

    class Meta:
        model = PageImage
        fields = ("page_id", "key", "image")
