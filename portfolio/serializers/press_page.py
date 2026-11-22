from rest_framework import serializers
from portfolio.serializers.entry_collection import collection_records
from portfolio.serializers.appearance import AppearanceSerializer
from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer


class PressPageSerializer(FeaturedPageSerializer):
    entries = serializers.SerializerMethodField()
    appearances = AppearanceSerializer(many=True)

    def get_entries(self, page):
        return ContentEntrySerializer(collection_records(page, "entries"), many=True).data
