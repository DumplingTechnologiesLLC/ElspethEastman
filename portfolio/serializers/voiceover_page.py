from rest_framework import serializers
from portfolio.serializers.entry_collection import collection_records
from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer


class VoiceoverPageSerializer(FeaturedPageSerializer):
    roles = serializers.SerializerMethodField()

    def get_roles(self, page):
        return ContentEntrySerializer(collection_records(page, "entries"), many=True).data
