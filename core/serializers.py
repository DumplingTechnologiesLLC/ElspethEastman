from rest_framework import serializers
from core.models import (
    Affiliations, Contact, Experience,
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


class AffiliationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Affiliations
        fields = (
            'id',
            'affiliation',
            'link'
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


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = (
            'id',
            'name',
            'email',
            'message'
        )


class SkillsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skills
        fields = (
            'game_development',
            'streaming',
            'voice_acting',
        )
