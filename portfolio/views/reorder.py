from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.serializers.reorder import ReorderSerializer
from portfolio.services.ordering import reorder_collection


class ReorderAPIView(ContentAPIView):
    def patch(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(reorder_collection(serializer.validated_data))
