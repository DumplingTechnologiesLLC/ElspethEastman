from contextlib import contextmanager

from django.db import transaction
from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from portfolio.models import Page


@contextmanager
def locked_page(page_id):
    """Serialize membership changes and ordering on the same aggregate root."""
    with transaction.atomic():
        yield get_object_or_404(Page.objects.select_for_update(), pk=page_id)


@contextmanager
def locked_page_registry(page_id):
    """Lock the six route owners in ID order so concurrent slug claims cannot race."""
    with transaction.atomic():
        pages = {page.public_id: page for page in Page.objects.select_for_update().order_by("pk")}
        if page_id not in pages:
            raise NotFound("Page content was not found.")
        yield pages[page_id]


def append_position(queryset):
    last = queryset.aggregate(last=Max("sort_order"))["last"]
    return 0 if last is None else last + 1
