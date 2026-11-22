from rest_framework import serializers

from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.page_content import PageContentSerializer


class VoiceoverPageSerializer(PageContentSerializer):
    roles = ContentEntrySerializer(source="entries", many=True)
    feature = serializers.SerializerMethodField()

    def get_feature(self, page):
        item_id = next((str(entry.public_id) for entry in page.entries.all() if entry.is_featured), None)
        return {"page_id": str(page.public_id), "item_id": item_id}
