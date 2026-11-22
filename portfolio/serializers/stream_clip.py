from rest_framework import serializers

from portfolio.models import ContentEntry
from portfolio.serializers.input import LinkInputSerializer, PageScopeSerializer, StrictInputSerializer
from portfolio.serializers.link import expand_link_input, link_value


class StreamClipSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="public_id", read_only=True)
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    action = serializers.SerializerMethodField()

    class Meta:
        model = ContentEntry
        fields = ("id", "page_id", "eyebrow", "title", "category", "action", "sort_order")

    def get_action(self, clip):
        return link_value(clip.action_label, clip.action_url)


class StreamClipPatchSerializer(StrictInputSerializer):
    eyebrow = serializers.CharField(max_length=300)
    title = serializers.CharField(max_length=300)
    category = serializers.CharField(max_length=200)
    action = LinkInputSerializer()

    def validate(self, data):
        return expand_link_input(data, "action")


class StreamClipCreateSerializer(StreamClipPatchSerializer, PageScopeSerializer):
    pass
