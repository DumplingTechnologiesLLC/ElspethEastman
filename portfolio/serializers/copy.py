from rest_framework import serializers
from portfolio.models import PageCopy


class CopyBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageCopy
        fields = ("id", "page_id", "key", "section", "kind", "value", "sort_order")
