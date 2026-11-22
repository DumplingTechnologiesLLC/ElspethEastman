from rest_framework import serializers
from rest_framework.exceptions import NotFound

from portfolio.models import MusicFeature
from portfolio.serializers.music import MusicFeatureSerializer, MusicReleaseSerializer
from portfolio.serializers.page_content import PageContentSerializer


class MusicPageSerializer(PageContentSerializer):
    feature = serializers.SerializerMethodField()
    releases = MusicReleaseSerializer(many=True)

    def get_feature(self, page):
        try:
            feature = page.music_feature
        except MusicFeature.DoesNotExist:
            raise NotFound("Music practice is not configured.")
        return MusicFeatureSerializer(feature).data
