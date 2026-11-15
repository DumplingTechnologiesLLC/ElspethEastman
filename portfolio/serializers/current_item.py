from rest_framework import serializers

from portfolio.models import CurrentItem
from portfolio.serializers.input import LinkInputSerializer, PageScopeSerializer, StrictInputSerializer
from portfolio.serializers.link import expand_link_input, link_value


class CurrentItemSerializer(serializers.ModelSerializer):
    link = serializers.SerializerMethodField()

    class Meta:
        model = CurrentItem
        fields = ("id", "page_id", "eyebrow", "title", "description", "link", "sort_order")

    def get_link(self, item):
        return link_value(item.link_label, item.link_url)


class CurrentItemPatchSerializer(StrictInputSerializer):
    eyebrow = serializers.CharField(max_length=300)
    title = serializers.CharField(max_length=300)
    description = serializers.CharField()
    link = LinkInputSerializer(allow_null=True)

    def validate(self, data):
        return expand_link_input(data, "link")


class CurrentItemCreateSerializer(CurrentItemPatchSerializer, PageScopeSerializer):
    pass
