from rest_framework import serializers

from portfolio.models import ContentEntry, ContentEntryMetadata
from portfolio.serializers.page_image import ImageUseSerializer


class ContentEntryMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentEntryMetadata
        fields = ("id", "entry_id", "key", "label", "value", "sort_order")


class ContentEntrySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()
    metadata = ContentEntryMetadataSerializer(many=True)

    class Meta:
        model = ContentEntry
        fields = ("id", "page_id", "title", "eyebrow", "description", "image", "action", "category",
                  "published_at", "metadata", "is_featured", "sort_order")

    def get_image(self, entry):
        return None if entry.asset_id is None else ImageUseSerializer(entry).data

    def get_action(self, entry):
        if entry.action_url is None:
            return None
        return {"label": entry.action_label, "href": entry.action_url, "is_external": True}
