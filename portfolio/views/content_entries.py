from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import ContentEntry
from portfolio.serializers.content_entry import ContentEntrySerializer
from portfolio.serializers.content_entry_input import ContentEntryCreateSerializer, ContentEntryPatchSerializer
from portfolio.serializers.input import parse_page_scope
from portfolio.services.ownership import locked_page


class ContentEntryAPIView(ContentAPIView):
    def post(self, request):
        with locked_page(parse_page_scope(request.data)) as page:
            serializer = ContentEntryCreateSerializer(data=request.data, context={"page": page})
            serializer.is_valid(raise_exception=True)
            return Response(ContentEntrySerializer(serializer.save()).data, status=201)


class ContentEntryDetailAPIView(ContentAPIView):
    def patch(self, request, item_id):
        page_id = get_object_or_404(ContentEntry, pk=item_id).page_id
        with locked_page(page_id) as page:
            row = get_object_or_404(ContentEntry, pk=item_id)
            serializer = ContentEntryPatchSerializer(row, data=request.data, partial=True, context={"page": page})
            serializer.is_valid(raise_exception=True)
            return Response(ContentEntrySerializer(serializer.save()).data)

    def delete(self, request, item_id):
        page_id = get_object_or_404(ContentEntry, pk=item_id).page_id
        with locked_page(page_id):
            get_object_or_404(ContentEntry, pk=item_id).delete()
        return Response(status=204)
