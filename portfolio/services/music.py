from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from portfolio.models import MediaAsset, MusicFeature, MusicRelease, PageKind, PracticeFact
from portfolio.services.ownership import append_position


def require_music_page(page):
    if page.kind != PageKind.MUSIC:
        raise ValidationError({"page_id": "This content belongs to the Music page."})


def apply_music_values(record, data, image_field):
    data = dict(data)
    data.pop("page_id", None)
    if image_field in data:
        image = data.pop(image_field)
        record.asset = get_object_or_404(MediaAsset, pk=image["asset_id"])
        record.alt_text, record.caption = image["alt_text"], image["caption"]
    if "action" in data:
        action = data.pop("action")
        record.action_label, record.action_url = action["label"], action["url"]
    for field, value in data.items():
        setattr(record, field, value)
    record.save()
    return record


def save_music_feature(page, data):
    require_music_page(page)
    with transaction.atomic():
        feature = get_object_or_404(MusicFeature, page=page)
        values = dict(data)
        facts = values.pop("facts")
        apply_music_values(feature, values, "image")
        feature.facts.all().delete()
        PracticeFact.objects.bulk_create([PracticeFact(feature=feature, sort_order=position, **row) for position, row in enumerate(facts)])
        return feature


def save_music_release(page, instance, data):
    require_music_page(page)
    record = instance if instance is not None else MusicRelease(page=page, sort_order=append_position(page.releases.all()))
    return apply_music_values(record, data, "artwork")
