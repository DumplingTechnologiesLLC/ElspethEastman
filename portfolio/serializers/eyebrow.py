from rest_framework import serializers
from portfolio.models import Eyebrow


class EyebrowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eyebrow
        fields = ("id", "page_id", "label", "sort_order")
