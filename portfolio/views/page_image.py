from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import MediaAsset, PageImage
from portfolio.serializers.image_input import PageImageWriteSerializer
from portfolio.serializers.page_image import PageImageSerializer
from portfolio.services.ownership import locked_page


class PageImageAPIView(ContentAPIView):
    def patch(self, request):
        serializer = PageImageWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data["page_id"]) as page:
            row = get_object_or_404(PageImage, page=page, key=data["key"])
            image = data["image"]
            row.asset = get_object_or_404(MediaAsset, pk=image["asset_id"])
            row.alt_text, row.caption = image["alt_text"], image["caption"]
            row.save()
            return Response(PageImageSerializer(row).data)
