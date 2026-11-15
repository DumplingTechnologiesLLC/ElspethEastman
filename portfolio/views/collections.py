from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import Eyebrow, TriviaItem
from portfolio.serializers.collection_input import (
    EyebrowCreateSerializer, EyebrowPatchSerializer, TriviaCreateSerializer, TriviaPatchSerializer,
)
from portfolio.serializers.eyebrow import EyebrowSerializer
from portfolio.serializers.trivia import TriviaSerializer
from portfolio.services.ownership import locked_page
from portfolio.services.owned_collections import OwnedCollection


class OwnedCollectionAPIView(ContentAPIView):
    """Write one collection while keeping its owner and ordering server-owned."""

    def post(self, request):
        serializer = self.create_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data.pop("page_id")) as page:
            row = self.collection.create(page, data)
            return Response(self.read_serializer(row).data, status=201)


class OwnedCollectionDetailAPIView(ContentAPIView):
    def patch(self, request, item_id):
        serializer = self.patch_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        page_id = get_object_or_404(self.collection.model, pk=item_id).page_id
        with locked_page(page_id) as page:
            row = get_object_or_404(self.collection.model, pk=item_id)
            row = self.collection.update(page, row, serializer.validated_data)
            return Response(self.read_serializer(row).data)

    def delete(self, request, item_id):
        page_id = get_object_or_404(self.collection.model, pk=item_id).page_id
        with locked_page(page_id) as page:
            self.collection.delete(page, get_object_or_404(self.collection.model, pk=item_id))
        return Response(status=204)


class EyebrowSettings:
    collection = OwnedCollection(Eyebrow)
    create_serializer = EyebrowCreateSerializer
    patch_serializer = EyebrowPatchSerializer
    read_serializer = EyebrowSerializer


class TriviaSettings:
    collection = OwnedCollection(TriviaItem, limit=3)
    create_serializer = TriviaCreateSerializer
    patch_serializer = TriviaPatchSerializer
    read_serializer = TriviaSerializer


class EyebrowAPIView(EyebrowSettings, OwnedCollectionAPIView):
    pass


class EyebrowDetailAPIView(EyebrowSettings, OwnedCollectionDetailAPIView):
    pass


class TriviaAPIView(TriviaSettings, OwnedCollectionAPIView):
    pass


class TriviaDetailAPIView(TriviaSettings, OwnedCollectionDetailAPIView):
    pass
