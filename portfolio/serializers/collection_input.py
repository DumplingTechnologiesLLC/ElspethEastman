from rest_framework import serializers

from portfolio.serializers.input import PageScopeSerializer, StrictInputSerializer


class EyebrowPatchSerializer(StrictInputSerializer):
    label = serializers.CharField(max_length=200, required=False)


class EyebrowCreateSerializer(PageScopeSerializer):
    label = serializers.CharField(max_length=200)


class TriviaPatchSerializer(EyebrowPatchSerializer):
    value = serializers.CharField(max_length=500, required=False)


class TriviaCreateSerializer(EyebrowCreateSerializer):
    value = serializers.CharField(max_length=500)
