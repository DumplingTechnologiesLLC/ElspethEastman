from rest_framework import serializers

from portfolio.models import MusicFeature, MusicRelease, PracticeFact
from portfolio.serializers.page_image import ImageUseSerializer


class MusicActionSerializer(serializers.Serializer):
    label = serializers.CharField(source="action_label")
    href = serializers.CharField(source="action_url")
    is_external = serializers.BooleanField(default=True)


class PracticeFactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeFact
        fields = ("label", "value")


class MusicFeatureSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    image = ImageUseSerializer(source="*")
    action = MusicActionSerializer(source="*")
    facts = PracticeFactSerializer(many=True)

    class Meta:
        model = MusicFeature
        fields = ("page_id", "eyebrow", "title", "description", "image", "facts", "action")


class MusicReleaseSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    id = serializers.UUIDField(source="public_id", read_only=True)
    artwork = ImageUseSerializer(source="*")
    action = MusicActionSerializer(source="*")

    class Meta:
        model = MusicRelease
        fields = ("id", "page_id", "year", "format", "title", "description", "artwork", "artwork_title", "action", "sort_order")
