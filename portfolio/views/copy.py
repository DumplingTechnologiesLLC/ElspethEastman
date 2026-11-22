from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from portfolio.api import ContentAPIView
from portfolio.models import PageCopy
from portfolio.serializers.copy import CopyBlockSerializer
from portfolio.serializers.copy_input import CopyCreateSerializer, CopyPatchSerializer, validate_copy_treatment
from portfolio.serializers.input import KeyedScopeSerializer
from portfolio.services.ownership import append_position, locked_page


class CopyAPIView(ContentAPIView):
    def post(self, request):
        serializer = CopyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data.pop("page_id")) as page:
            validate_copy_treatment(page, data["section"], data["kind"])
            if page.copy.filter(key=data["key"]).exists():
                raise ValidationError({"key": "This key already belongs to a copy block."})
            row = PageCopy.objects.create(page=page, sort_order=append_position(page.copy.filter(section=data["section"])), **data)
            return Response(CopyBlockSerializer(row).data, status=201)

    def patch(self, request):
        serializer = CopyPatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with locked_page(data.pop("page_id")) as page:
            row = get_object_or_404(PageCopy, page=page, key=data.pop("key"))
            validate_copy_treatment(page, row.section, data.get("kind", row.kind))
            for field, value in data.items():
                setattr(row, field, value)
            row.save()
            return Response(CopyBlockSerializer(row).data)

    def delete(self, request):
        serializer = KeyedScopeSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        with locked_page(serializer.validated_data["page_id"]) as page:
            get_object_or_404(PageCopy, page=page, key=serializer.validated_data["key"]).delete()
        return Response(status=204)
