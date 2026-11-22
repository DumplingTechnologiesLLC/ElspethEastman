from rest_framework import serializers
from portfolio.models import Eyebrow


class EyebrowSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    id = serializers.UUIDField(source="public_id", read_only=True)
    class Meta:
        model = Eyebrow
        fields = ("id", "page_id", "label", "sort_order")
