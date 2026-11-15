from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer


class VoiceoverPageSerializer(FeaturedPageSerializer):
    roles = ContentEntrySerializer(source="entries", many=True)
