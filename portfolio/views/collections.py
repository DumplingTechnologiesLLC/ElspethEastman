from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import Eyebrow, TriviaItem
from portfolio.serializers.collection_input import (
    EyebrowCreateSerializer, EyebrowPatchSerializer, TriviaCreateSerializer, TriviaPatchSerializer,
)
from portfolio.serializers.eyebrow import EyebrowSerializer
from portfolio.serializers.trivia import TriviaSerializer
from portfolio.services.ownership import append_position, locked_page


class OwnedCollectionAPIView(ContentAPIView):
    """Write one collection while keeping its owner and ordering server-owned."""

    limit = None

    def post(self, request):
        serializer = self.create_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data.pop("page_id")) as page:
            collection = self.model.objects.filter(page=page)
            if self.limit is not None and collection.count() >= self.limit:
                raise ValidationError({"page_id": f"This page supports at most {self.limit} facts."})
            row = self.model.objects.create(page=page, sort_order=append_position(collection), **data)
            return Response(self.read_serializer(row).data, status=201)


class OwnedCollectionDetailAPIView(ContentAPIView):
    def patch(self, request, item_id):
        serializer = self.patch_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        page_id = get_object_or_404(self.model, pk=item_id).page_id
        with locked_page(page_id):
            row = get_object_or_404(self.model, pk=item_id)
            for field, value in serializer.validated_data.items():
                setattr(row, field, value)
            row.save()
            return Response(self.read_serializer(row).data)

    def delete(self, request, item_id):
        page_id = get_object_or_404(self.model, pk=item_id).page_id
        with locked_page(page_id):
            get_object_or_404(self.model, pk=item_id).delete()
        return Response(status=204)


class EyebrowSettings:
    model = Eyebrow
    create_serializer = EyebrowCreateSerializer
    patch_serializer = EyebrowPatchSerializer
    read_serializer = EyebrowSerializer


class TriviaSettings:
    model = TriviaItem
    create_serializer = TriviaCreateSerializer
    patch_serializer = TriviaPatchSerializer
    read_serializer = TriviaSerializer
    limit = 3


class EyebrowAPIView(EyebrowSettings, OwnedCollectionAPIView):
    pass


class EyebrowDetailAPIView(EyebrowSettings, OwnedCollectionDetailAPIView):
    pass


class TriviaAPIView(TriviaSettings, OwnedCollectionAPIView):
    pass


class TriviaDetailAPIView(TriviaSettings, OwnedCollectionDetailAPIView):
    pass
