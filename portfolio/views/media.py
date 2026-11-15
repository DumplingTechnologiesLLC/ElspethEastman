from django.conf import settings
from rest_framework.exceptions import APIException
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.serializers.media_asset import MediaAssetSerializer
from portfolio.serializers.media_upload import MediaUploadSerializer
from portfolio.services.media_upload import store_upload


class MediaUnavailable(APIException):
    status_code = 503
    default_detail = "Image uploads are not configured for this environment."


class MediaAssetAPIView(ContentAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if not settings.MEDIA_UPLOADS_ENABLED:
            raise MediaUnavailable()
        serializer = MediaUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        asset = store_upload(data["file"], data["decoded"], data["credit"], data["source_url"])
        return Response(MediaAssetSerializer(asset).data, status=201)
