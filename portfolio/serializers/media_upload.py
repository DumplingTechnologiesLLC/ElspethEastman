from rest_framework import serializers

from portfolio.serializers.input import HTTPURLField, StrictInputSerializer
from portfolio.services.media_upload import inspect_upload


class MediaUploadSerializer(StrictInputSerializer):
    file = serializers.FileField()
    credit = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")
    source_url = HTTPURLField(max_length=2000, allow_blank=True, required=False, default="")

    def validate(self, data):
        data["decoded"] = inspect_upload(data["file"])
        return data
