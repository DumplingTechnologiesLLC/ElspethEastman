from rest_framework import serializers

from portfolio.models import Page, PageKind
from portfolio.serializers.input import LinkInputSerializer, StrictInputSerializer


RESERVED_SLUGS = {"api", "admin", "cms", "login", "static", "media", "projects"}
EXTERNAL_ACTION_PAGES = {PageKind.VOICEOVER, PageKind.STREAMING, PageKind.PRESS}


class PageMetadataSerializer(StrictInputSerializer):
    title = serializers.CharField(max_length=200, required=False)
    slug = serializers.SlugField(max_length=100, allow_blank=True, required=False)
    primary_action = LinkInputSerializer(allow_null=True, required=False)

    def validate(self, data):
        page = self.context["page"]
        if "slug" in data:
            slug = data["slug"]
            if (page.kind == PageKind.HOME and slug != "") or (page.kind != PageKind.HOME and slug == ""):
                raise serializers.ValidationError({"slug": "Only Home has an empty, immutable slug."})
            if slug.lower() in RESERVED_SLUGS:
                raise serializers.ValidationError({"slug": "This path is reserved."})
            if Page.objects.exclude(pk=page.pk).filter(slug=slug).exists():
                raise serializers.ValidationError({"slug": "This path already belongs to another page."})
        if data.get("primary_action") is not None and page.kind not in EXTERNAL_ACTION_PAGES:
            raise serializers.ValidationError({"primary_action": "This page uses a code-defined action."})
        return data

    def update(self, instance, validated_data):
        if "primary_action" in validated_data:
            action = validated_data.pop("primary_action")
            instance.primary_action_label = None if action is None else action["label"]
            instance.primary_action_url = None if action is None else action["url"]
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
