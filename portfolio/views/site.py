from rest_framework.response import Response
from portfolio.api import ContentAPIView
from portfolio.models import Page
from portfolio.serializers.page import PageDescriptorSerializer


class SiteAPIView(ContentAPIView):
    def get(self, request):
        pages = Page.objects.order_by("id")
        return Response({"pages": PageDescriptorSerializer(pages, many=True).data})
