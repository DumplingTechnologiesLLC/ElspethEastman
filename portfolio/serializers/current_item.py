from rest_framework import serializers

from portfolio.models import ContentEntry
from portfolio.serializers.input import LinkInputSerializer, PageScopeSerializer, StrictInputSerializer
from portfolio.serializers.link import expand_link_input, link_value


class CurrentItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="public_id", read_only=True)
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    link = serializers.SerializerMethodField()

    class Meta:
        model = ContentEntry
        fields = ("id", "page_id", "eyebrow", "title", "description", "link", "sort_order")

    def get_link(self, item):
        return link_value(item.action_label, item.action_url)


class CurrentItemPatchSerializer(StrictInputSerializer):
    eyebrow = serializers.CharField(max_length=300)
    title = serializers.CharField(max_length=300)
    description = serializers.CharField()
    link = LinkInputSerializer(allow_null=True)

    def validate(self, data):
        return expand_link_input({"action" if key == "link" else key: value for key, value in data.items()}, "action")


class CurrentItemCreateSerializer(CurrentItemPatchSerializer, PageScopeSerializer):
    pass
