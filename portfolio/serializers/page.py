from rest_framework import serializers

from portfolio.models import Page


class PageDescriptorSerializer(serializers.ModelSerializer):
    primary_action = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = ("id", "kind", "title", "slug", "primary_action")

    def get_primary_action(self, page):
        if page.primary_action_url is None:
            return None
        return {"label": page.primary_action_label, "href": page.primary_action_url,
                "is_external": True}
