from dataclasses import dataclass, field

from django.db import models
from rest_framework.exceptions import ValidationError

from portfolio.services.ownership import append_position


@dataclass(frozen=True)
class OwnedCollection:
    """Membership rules applied inside the caller's locked Page transaction."""

    model: type[models.Model]
    page_kind: str | None = None
    limit: int | None = None
    filters: dict = field(default_factory=dict)

    def queryset(self):
        return self.model.objects.filter(**self.filters)

    def require_owner(self, page):
        if self.page_kind is not None and page.kind != self.page_kind:
            raise ValidationError({"page_id": "This content does not belong to that page kind."})

    def create(self, page, data):
        self.require_owner(page)
        collection = self.queryset().filter(page=page)
        if self.limit is not None and collection.count() >= self.limit:
            raise ValidationError({"page_id": f"This page supports at most {self.limit} facts."})
        return self.model.objects.create(page=page, sort_order=append_position(collection), **self.filters, **data)

    def update(self, page, row, data):
        self.require_owner(page)
        for field, value in data.items():
            setattr(row, field, value)
        row.save()
        return row

    def delete(self, page, row):
        self.require_owner(page)
        row.delete()
