from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from portfolio.models import ContentEntry, ContentEntryMetadata, MediaAsset, PageKind
from portfolio.services.ownership import append_position


ENTRY_PAGE_KINDS = {PageKind.VOICEOVER, PageKind.PRESS, PageKind.STREAMING}


def validate_entry(page, instance, data):
    if page.kind not in ENTRY_PAGE_KINDS:
        raise ValidationError({"page_id": "This page does not own content entries."})
    has_image = data["image"] is not None if "image" in data else instance.asset_id is not None
    if not has_image and (page.kind != PageKind.STREAMING or (instance is not None and instance.is_featured)):
        raise ValidationError({"image": "An image is required for this entry."})
    has_action = data["action"] is not None if "action" in data else instance.action_url is not None
    if not has_action and page.kind != PageKind.VOICEOVER:
        raise ValidationError({"action": "An external action is required for this entry."})
    category = data.get("category", None if instance is None else instance.category)
    if page.kind == PageKind.VOICEOVER and category is not None:
        raise ValidationError({"category": "Voiceover roles do not use a category."})
    published_at = data.get("published_at", None if instance is None else instance.published_at)
    if page.kind != PageKind.PRESS and published_at is not None:
        raise ValidationError({"published_at": "Only Press entries have a publication datetime."})
    if page.kind == PageKind.PRESS:
        has_outlet = (any(row["key"] == "outlet" for row in data["metadata"]) if "metadata" in data
                      else instance.metadata.filter(key="outlet").exists())
        if not has_outlet:
            raise ValidationError({"metadata": "Press entries require an outlet fact."})


def replace_metadata(entry, rows):
    existing = {row.key: row for row in entry.metadata.all()}
    entry.metadata.exclude(key__in=[row["key"] for row in rows]).delete()
    for position, data in enumerate(rows):
        row = existing.get(data["key"])
        if row is None:
            row = ContentEntryMetadata(entry=entry, key=data["key"])
        row.label, row.value, row.sort_order = data["label"], data["value"], position
        row.save()


def save_entry(page, instance, data):
    """Persist an entry and its complete nested facts under the caller's Page lock."""
    with transaction.atomic():
        entry = instance if instance is not None else ContentEntry(page=page, sort_order=append_position(page.entries.filter(collection="entries")))
        data = dict(data)
        if "image" in data:
            image = data.pop("image")
            entry.asset = None if image is None else get_object_or_404(MediaAsset, pk=image["asset_id"])
            entry.alt_text = "" if image is None else image["alt_text"]
            entry.caption = "" if image is None else image["caption"]
        if "action" in data:
            action = data.pop("action")
            entry.action_label = None if action is None else action["label"]
            entry.action_url = None if action is None else action["url"]
        metadata = data.pop("metadata", None)
        for field, value in data.items():
            setattr(entry, field, value)
        entry.save()
        if metadata is not None:
            replace_metadata(entry, metadata)
        return entry
