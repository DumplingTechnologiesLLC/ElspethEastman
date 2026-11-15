from rest_framework import serializers

from portfolio.serializers.image_input import ImageUseInputSerializer
from portfolio.serializers.input import CompleteInputSerializer, LinkInputSerializer, PageScopeSerializer, StrictInputSerializer


class PracticeFactInputSerializer(CompleteInputSerializer):
    label = serializers.CharField(max_length=200)
    value = serializers.CharField(max_length=500)


class MusicFeatureInputSerializer(PageScopeSerializer):
    eyebrow = serializers.CharField(max_length=300)
    title = serializers.CharField(max_length=300)
    description = serializers.CharField()
    image = ImageUseInputSerializer()
    facts = PracticeFactInputSerializer(many=True, max_length=2)
    action = LinkInputSerializer()


class MusicReleasePatchSerializer(StrictInputSerializer):
    year = serializers.CharField(max_length=20, allow_blank=True)
    format = serializers.CharField(max_length=200)
    title = serializers.CharField(max_length=300)
    description = serializers.CharField()
    artwork = ImageUseInputSerializer()
    artwork_title = serializers.CharField(max_length=300, allow_blank=True)
    action = LinkInputSerializer()


class MusicReleaseCreateSerializer(MusicReleasePatchSerializer, PageScopeSerializer):
    pass
