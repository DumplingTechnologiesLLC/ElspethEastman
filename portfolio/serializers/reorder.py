from rest_framework import serializers

from portfolio.serializers.input import PageScopeSerializer


class ReorderSerializer(PageScopeSerializer):
    collection = serializers.CharField()
    section = serializers.SlugField(allow_null=True)
    ordered_ids = serializers.ListField(child=serializers.IntegerField(min_value=1))
