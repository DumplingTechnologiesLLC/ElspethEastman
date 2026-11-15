from rest_framework import serializers

from portfolio.serializers.input import KeyedScopeSerializer, StrictInputSerializer


class ImageUseInputSerializer(StrictInputSerializer):
    asset_id = serializers.IntegerField(min_value=1)
    alt_text = serializers.CharField(max_length=2000)
    caption = serializers.CharField(allow_blank=True)


class PageImageWriteSerializer(KeyedScopeSerializer):
    image = ImageUseInputSerializer()
