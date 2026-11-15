from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from portfolio.models import ContentEntry
from portfolio.services.content_entries import ENTRY_PAGE_KINDS
from portfolio.services.ownership import locked_page


def select_feature(page_id, item_id):
    """Select an existing member without changing its identity or stored position."""
    with locked_page(page_id) as page:
        if page.kind not in ENTRY_PAGE_KINDS:
            raise ValidationError({"page_id": "This page does not support entry promotion."})
        entry = None
        if item_id is not None:
            entry = get_object_or_404(ContentEntry, page=page, pk=item_id)
            if entry.asset_id is None:
                raise ValidationError({"item_id": "Add an image before featuring this entry."})
        page.entries.filter(is_featured=True).update(is_featured=False)
        if entry is not None:
            entry.is_featured = True
            entry.save(update_fields=("is_featured",))
        return {"page_id": page.pk, "item_id": item_id}
