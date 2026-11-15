from portfolio.serializers.appearance import AppearanceSerializer
from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.featured_page import FeaturedPageSerializer


class PressPageSerializer(FeaturedPageSerializer):
    entries = ContentEntrySerializer(many=True)
    appearances = AppearanceSerializer(many=True)
