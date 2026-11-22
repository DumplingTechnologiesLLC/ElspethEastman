"""Translate public UUID references at the HTTP boundary."""
from rest_framework import serializers
from rest_framework.exceptions import NotFound


class PublicUUIDField(serializers.UUIDField):
    default_error_messages = {'invalid': 'A valid UUIDv4 identifier is required.'}

    def to_internal_value(self, value):
        if not isinstance(value, str):
            self.fail('invalid')
        identifier = super().to_internal_value(value)
        if identifier.version != 4:
            self.fail('invalid')
        return identifier


class PublicReferenceField(PublicUUIDField):
    def __init__(self, model, **kwargs):
        self.model = model
        super().__init__(**kwargs)

    def to_internal_value(self, value):
        identifier = super().to_internal_value(value)
        try:
            return self.model.objects.only('pk').get(public_id=identifier).pk
        except self.model.DoesNotExist:
            raise NotFound('Referenced content was not found.')
