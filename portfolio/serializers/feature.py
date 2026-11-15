from rest_framework import serializers

from portfolio.serializers.input import PageScopeSerializer


class FeatureInputSerializer(PageScopeSerializer):
    item_id = serializers.IntegerField(min_value=1, allow_null=True)
