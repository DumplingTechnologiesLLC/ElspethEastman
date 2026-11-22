from rest_framework import serializers
from portfolio.models import PageCopy


class CopyBlockSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    id = serializers.UUIDField(source="public_id", read_only=True)
    class Meta:
        model = PageCopy
        fields = ("id", "page_id", "key", "section", "kind", "value", "sort_order")
