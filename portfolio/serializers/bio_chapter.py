from rest_framework import serializers

from portfolio.models import BioChapter
from portfolio.serializers.input import PageScopeSerializer, StrictInputSerializer


class BioChapterSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="public_id", read_only=True)
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    class Meta:
        model = BioChapter
        fields = ("id", "page_id", "eyebrow", "heading", "body", "sort_order")


class BioChapterPatchSerializer(StrictInputSerializer):
    eyebrow = serializers.CharField(max_length=300)
    heading = serializers.CharField(max_length=300)
    body = serializers.CharField()


class BioChapterCreateSerializer(BioChapterPatchSerializer, PageScopeSerializer):
    pass
