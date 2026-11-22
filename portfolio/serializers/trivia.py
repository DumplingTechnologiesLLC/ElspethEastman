from rest_framework import serializers
from portfolio.models import TriviaItem


class TriviaSerializer(serializers.ModelSerializer):
    page_id = serializers.UUIDField(source="page.public_id", read_only=True)
    id = serializers.UUIDField(source="public_id", read_only=True)
    class Meta:
        model = TriviaItem
        fields = ("id", "page_id", "label", "value", "sort_order")
