from rest_framework import serializers
from portfolio.serializers.entry_collection import collection_records
from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer
from portfolio.serializers.stream_clip import StreamClipSerializer


class StreamingPageSerializer(FeaturedPageSerializer):
    entries = serializers.SerializerMethodField()
    clips = serializers.SerializerMethodField()

    def get_entries(self, page):
        return ContentEntrySerializer(collection_records(page, "entries"), many=True).data

    def get_clips(self, page):
        return StreamClipSerializer(collection_records(page, "stream_clips"), many=True).data
