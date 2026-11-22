from django.db.models import Prefetch, prefetch_related_objects
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from portfolio.api import ContentAPIView
from portfolio.models import ContentEntry, MusicFeature, MusicRelease, Page, PageImage, PageKind
from portfolio.serializers.page_content import PageContentSerializer
from portfolio.serializers.page import PageDescriptorSerializer
from portfolio.serializers.page_metadata import PageMetadataSerializer
from portfolio.serializers.voiceover_page import VoiceoverPageSerializer
from portfolio.serializers.music_page import MusicPageSerializer
from portfolio.serializers.streaming_page import StreamingPageSerializer
from portfolio.serializers.press_page import PressPageSerializer
from portfolio.serializers.bio_page import BioPageSerializer
from portfolio.services.ownership import locked_page_registry


PAGE_READERS = {PageKind.HOME: PageContentSerializer, PageKind.VOICEOVER: VoiceoverPageSerializer, PageKind.MUSIC: MusicPageSerializer,
                PageKind.STREAMING: StreamingPageSerializer, PageKind.PRESS: PressPageSerializer, PageKind.BIO: BioPageSerializer}
PAGE_PREFETCHES = {
    PageKind.VOICEOVER: [Prefetch("entries", queryset=ContentEntry.objects.select_related("asset").prefetch_related("metadata"))],
    PageKind.MUSIC: [Prefetch("music_feature", queryset=MusicFeature.objects.select_related("asset").prefetch_related("facts")),
                     Prefetch("releases", queryset=MusicRelease.objects.select_related("asset"))],
    PageKind.STREAMING: [Prefetch("entries", queryset=ContentEntry.objects.select_related("asset").prefetch_related("metadata")), "clips"],
    PageKind.PRESS: [Prefetch("entries", queryset=ContentEntry.objects.select_related("asset").prefetch_related("metadata")), "appearances"],
    PageKind.BIO: ["chapters", "current_items"],
}


def page_content_queryset():
    return Page.objects.prefetch_related(
        "copy", "eyebrows", "trivia",
        Prefetch("images", queryset=PageImage.objects.select_related("asset").order_by("id")),
    )


class PageDetailAPIView(ContentAPIView):
    def patch(self, request, page_id):
        with locked_page_registry(page_id) as page:
            serializer = PageMetadataSerializer(page, data=request.data, context={"page": page})
            serializer.is_valid(raise_exception=True)
            return Response(PageDescriptorSerializer(serializer.save()).data)

    def get(self, request, page_id):
        page = get_object_or_404(page_content_queryset(), public_id=page_id)
        reader = PAGE_READERS[page.kind]
        prefetch_related_objects([page], *PAGE_PREFETCHES.get(page.kind, []))
        return Response(reader(page).data)
