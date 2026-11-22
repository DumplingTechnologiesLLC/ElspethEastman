from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from portfolio.api import ContentAPIView
from portfolio.models import Page, PageImage, PageKind
from portfolio.serializers.page_content import PageContentSerializer


# Specialized aggregates are introduced alongside their page implementation.
PAGE_READERS = {PageKind.HOME: PageContentSerializer}


def page_content_queryset():
    return Page.objects.prefetch_related(
        "copy", "eyebrows", "trivia",
        Prefetch("images", queryset=PageImage.objects.select_related("asset").order_by("id")),
    )


class PageDetailAPIView(ContentAPIView):
    def get(self, request, page_id):
        page = get_object_or_404(page_content_queryset(), public_id=page_id)
        reader = PAGE_READERS.get(page.kind)
        if reader is None:
            raise NotFound("Page content was not found.")
        return Response(reader(page).data)
