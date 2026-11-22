from rest_framework import serializers
from portfolio.serializers.entry_collection import collection_records
from portfolio.serializers.bio_chapter import BioChapterSerializer
from portfolio.serializers.current_item import CurrentItemSerializer
from portfolio.serializers.page_content import PageContentSerializer


class BioPageSerializer(PageContentSerializer):
    chapters = BioChapterSerializer(many=True)
    current_items = serializers.SerializerMethodField()

    def get_current_items(self, page):
        return CurrentItemSerializer(collection_records(page, "current_items"), many=True).data
