from rest_framework import serializers
from portfolio.models import TriviaItem


class TriviaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriviaItem
        fields = ("id", "page_id", "label", "value", "sort_order")
