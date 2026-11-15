from rest_framework import serializers

from portfolio.models import Appearance
from portfolio.serializers.input import HTTPURLField, PageScopeSerializer, StrictInputSerializer


class AppearanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appearance
        fields = ("id", "page_id", "year", "title", "format", "url", "sort_order")


class AppearancePatchSerializer(StrictInputSerializer):
    year = serializers.CharField(max_length=20)
    title = serializers.CharField(max_length=300)
    format = serializers.CharField(max_length=200)
    url = HTTPURLField(max_length=2000, allow_null=True)


class AppearanceCreateSerializer(AppearancePatchSerializer, PageScopeSerializer):
    pass
