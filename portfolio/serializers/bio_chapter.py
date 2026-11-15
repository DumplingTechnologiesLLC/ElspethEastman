from rest_framework import serializers

from portfolio.models import BioChapter
from portfolio.serializers.input import PageScopeSerializer, StrictInputSerializer


class BioChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BioChapter
        fields = ("id", "page_id", "eyebrow", "heading", "body", "sort_order")


class BioChapterPatchSerializer(StrictInputSerializer):
    eyebrow = serializers.CharField(max_length=300)
    heading = serializers.CharField(max_length=300)
    body = serializers.CharField()


class BioChapterCreateSerializer(BioChapterPatchSerializer, PageScopeSerializer):
    pass
