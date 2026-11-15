from rest_framework import serializers

from portfolio.models import CopyKind, PageKind
from portfolio.serializers.input import KeyedScopeSerializer


COPY_SECTIONS = {
    PageKind.HOME: {"intro"},
    PageKind.VOICEOVER: {"intro", "roles"},
    PageKind.MUSIC: {"intro", "releases"},
    PageKind.STREAMING: {"intro", "streams", "clips"},
    PageKind.PRESS: {"intro", "coverage", "appearances"},
    PageKind.BIO: {"intro", "short_bio", "story", "current", "explore"},
}


def validate_copy_treatment(page, section, kind):
    if section not in COPY_SECTIONS[page.kind]:
        raise serializers.ValidationError({"section": "This section is not supported by the page."})
    is_text_region = section in {"intro", "short_bio"}
    if (kind == CopyKind.SECTION_LABEL) == is_text_region:
        raise serializers.ValidationError({"kind": "This treatment is not supported by the section."})


class CopyCreateSerializer(KeyedScopeSerializer):
    section = serializers.SlugField(max_length=100)
    kind = serializers.ChoiceField(choices=CopyKind.choices)
    value = serializers.CharField()


class CopyPatchSerializer(KeyedScopeSerializer):
    kind = serializers.ChoiceField(choices=CopyKind.choices, required=False)
    value = serializers.CharField(required=False)
