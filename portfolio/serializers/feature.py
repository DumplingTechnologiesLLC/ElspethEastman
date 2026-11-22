from portfolio.serializers.identity import PublicUUIDField

from portfolio.serializers.input import PageScopeSerializer


class FeatureInputSerializer(PageScopeSerializer):
    item_id = PublicUUIDField(allow_null=True)
