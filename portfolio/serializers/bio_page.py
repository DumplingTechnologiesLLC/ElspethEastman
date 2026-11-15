from portfolio.serializers.bio_chapter import BioChapterSerializer
from portfolio.serializers.current_item import CurrentItemSerializer
from portfolio.serializers.page_content import PageContentSerializer


class BioPageSerializer(PageContentSerializer):
    chapters = BioChapterSerializer(many=True)
    current_items = CurrentItemSerializer(many=True)
