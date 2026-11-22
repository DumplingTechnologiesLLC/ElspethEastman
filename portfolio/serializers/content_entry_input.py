from datetime import timezone as datetime_timezone

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers

from portfolio.serializers.image_input import ImageUseInputSerializer
from portfolio.serializers.input import CompleteInputSerializer, LinkInputSerializer, PageScopeSerializer, StrictInputSerializer
from portfolio.services.content_entries import save_entry, validate_entry


class PublicationDateTimeField(serializers.DateTimeField):
    def to_internal_value(self, value):
        if not isinstance(value, str):
            self.fail("invalid", format="ISO 8601 with an explicit timezone")
        try:
            parsed = parse_datetime(value)
        except ValueError:
            parsed = None
        if parsed is None or timezone.is_naive(parsed):
            self.fail("invalid", format="ISO 8601 with an explicit timezone")
        return super().to_internal_value(value)


class MetadataInputSerializer(CompleteInputSerializer):
    key = serializers.SlugField(max_length=100)
    label = serializers.CharField(max_length=200)
    value = serializers.CharField()


class ContentEntryPatchSerializer(StrictInputSerializer):
    title = serializers.CharField(max_length=300)
    eyebrow = serializers.CharField(max_length=300)
    description = serializers.CharField()
    image = ImageUseInputSerializer(allow_null=True)
    action = LinkInputSerializer(allow_null=True)
    category = serializers.CharField(max_length=200, allow_null=True)
    published_at = PublicationDateTimeField(allow_null=True, default_timezone=datetime_timezone.utc)
    metadata = MetadataInputSerializer(many=True)

    def validate_metadata(self, rows):
        keys = [row["key"] for row in rows]
        if len(keys) != len(set(keys)):
            raise serializers.ValidationError("Fact keys must be unique within an entry.")
        return rows

    def validate(self, data):
        validate_entry(self.context["page"], self.instance, data)
        return data

    def update(self, instance, validated_data):
        return save_entry(self.context["page"], instance, validated_data)


class ContentEntryCreateSerializer(ContentEntryPatchSerializer, PageScopeSerializer):
    def create(self, validated_data):
        validated_data.pop("page_id")
        return save_entry(self.context["page"], None, validated_data)
