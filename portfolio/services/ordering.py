from rest_framework.exceptions import ValidationError

from portfolio.models import Eyebrow, PageCopy, TriviaItem
from portfolio.serializers.copy_input import COPY_SECTIONS
from portfolio.services.ownership import locked_page


COLLECTION_MODELS = {"copy": PageCopy, "eyebrows": Eyebrow, "trivia": TriviaItem}


def reorder_collection(data):
    with locked_page(data["page_id"]) as page:
        collection, section, ids = data["collection"], data["section"], data["ordered_ids"]
        model = COLLECTION_MODELS.get(collection)
        if model is None:
            raise ValidationError({"collection": "This collection cannot be reordered."})
        queryset = model.objects.filter(page=page)
        if collection == "copy":
            if section not in COPY_SECTIONS[page.kind]:
                raise ValidationError({"section": "Supply a supported copy section."})
            queryset = queryset.filter(section=section)
        elif section is not None:
            raise ValidationError({"section": "This collection does not have sections."})
        members = {row.public_id: row for row in queryset}
        if len(ids) != len(set(ids)) or set(ids) != set(members):
            raise ValidationError({"ordered_ids": "Include every current member exactly once."})
        ordered = [members[pk] for pk in ids]
        for position, row in enumerate(ordered):
            row.sort_order = position
        model.objects.bulk_update(ordered, ["sort_order"])
        return {**data, "page_id": page.public_id}
