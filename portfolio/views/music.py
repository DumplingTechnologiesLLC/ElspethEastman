from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import MusicRelease
from portfolio.serializers.music import MusicFeatureSerializer, MusicReleaseSerializer
from portfolio.serializers.music_input import MusicFeatureInputSerializer, MusicReleaseCreateSerializer, MusicReleasePatchSerializer
from portfolio.services.music import save_music_feature, save_music_release
from portfolio.services.ownership import locked_page


class MusicFeatureAPIView(ContentAPIView):
    def patch(self, request):
        serializer = MusicFeatureInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data["page_id"]) as page:
            return Response(MusicFeatureSerializer(save_music_feature(page, data)).data)


class MusicReleaseAPIView(ContentAPIView):
    def post(self, request):
        serializer = MusicReleaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data["page_id"]) as page:
            return Response(MusicReleaseSerializer(save_music_release(page, None, data)).data, status=201)


class MusicReleaseDetailAPIView(ContentAPIView):
    def patch(self, request, item_id):
        serializer = MusicReleasePatchSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        page_id = get_object_or_404(MusicRelease, public_id=item_id).page_id
        with locked_page(page_id) as page:
            row = get_object_or_404(MusicRelease, public_id=item_id)
            return Response(MusicReleaseSerializer(save_music_release(page, row, serializer.validated_data)).data)

    def delete(self, request, item_id):
        page_id = get_object_or_404(MusicRelease, public_id=item_id).page_id
        with locked_page(page_id):
            get_object_or_404(MusicRelease, public_id=item_id).delete()
        return Response(status=204)
