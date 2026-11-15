from collections.abc import Mapping

from django.core.validators import URLValidator
from rest_framework import serializers


class StrictInputSerializer(serializers.Serializer):
    """Reject unowned fields instead of silently discarding attempted writes."""

    def to_internal_value(self, data):
        if isinstance(data, Mapping):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError({key: ["This field cannot be written."] for key in sorted(unknown)})
        return super().to_internal_value(data)


class HTTPURLField(serializers.URLField):
    default_validators = [URLValidator(schemes=("http", "https"))]


class LinkInputSerializer(StrictInputSerializer):
    label = serializers.CharField(max_length=200)
    url = HTTPURLField(max_length=2000)


class PageScopeSerializer(StrictInputSerializer):
    page_id = serializers.IntegerField(min_value=1)


class KeyedScopeSerializer(PageScopeSerializer):
    key = serializers.SlugField(max_length=100)
