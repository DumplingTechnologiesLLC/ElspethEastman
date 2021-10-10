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
            'category',
            'tba'
        )

    # def clean_year(self, value):
    #     if not isinstance(value, int) and


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
            'tba',
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
            'id',
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

    def validate(self, data):
        if data.get('game_development', None) is None or data['game_development'] == '':
            raise serializers.ValidationError(
                "Game Development cannot be blank.")
        if data.get('streaming', None) is None or data['streaming'] == '':
            raise serializers.ValidationError("Streaming cannot be blank.")
        if data.get('voice_acting', None) is None or data['voice_acting'] == '':
            raise serializers.ValidationError("Voice Acting cannot be blank.")
        return data

    class Meta:
        model = Skills
        fields = (
            'game_development',
            'streaming',
            'voice_acting',
        )
