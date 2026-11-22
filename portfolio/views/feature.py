from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.serializers.feature import FeatureInputSerializer
from portfolio.services.promotion import select_feature


class FeaturedItemAPIView(ContentAPIView):
    def patch(self, request):
        serializer = FeatureInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response(select_feature(data["page_id"], data["item_id"]))
