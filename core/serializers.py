from rest_framework import serializers
from core.models import (
    Experience,
    FooterStat,
    Project,
    Skills
)


class ExperienceCreationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Experience
        fields = (
            'id',
            'year',
            'credit',
            'link',
            'category'
        )


class ExperienceSerializer(serializers.ModelSerializer):

    year = serializers.SerializerMethodField()

    def get_year(self, obj):
        return '(TBA)' if obj.tba else f"({obj.year})" if obj.year is not None else ''

    class Meta:
        model = Experience
        fields = (
            'id',
            'year',
            'link',
            'credit'
        )


class FooterStatSerializer(serializers.ModelSerializer):

    class Meta:
        model = FooterStat
        fields = (
            'id',
            'value',
            'label',
            'percent'
        )


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = (
            'src',
            'title'
        )
