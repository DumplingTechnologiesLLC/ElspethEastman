from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer
from portfolio.serializers.stream_clip import StreamClipSerializer


class StreamingPageSerializer(FeaturedPageSerializer):
    entries = ContentEntrySerializer(many=True)
    clips = StreamClipSerializer(many=True)
