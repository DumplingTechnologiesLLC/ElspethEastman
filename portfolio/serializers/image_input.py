from rest_framework import serializers
from portfolio.models import MediaAsset
from portfolio.serializers.identity import PublicReferenceField

from portfolio.serializers.input import CompleteInputSerializer, KeyedScopeSerializer


class ImageUseInputSerializer(CompleteInputSerializer):
    asset_id = PublicReferenceField(MediaAsset)
    alt_text = serializers.CharField(max_length=2000)
    caption = serializers.CharField(allow_blank=True)


class PageImageWriteSerializer(KeyedScopeSerializer):
    image = ImageUseInputSerializer()
