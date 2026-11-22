from rest_framework import serializers
from portfolio.serializers.identity import PublicUUIDField

from portfolio.serializers.input import PageScopeSerializer


class ReorderSerializer(PageScopeSerializer):
    collection = serializers.CharField()
    section = serializers.SlugField(allow_null=True)
    ordered_ids = serializers.ListField(child=PublicUUIDField())
