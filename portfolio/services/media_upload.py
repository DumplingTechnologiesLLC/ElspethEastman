from dataclasses import dataclass
from uuid import uuid4
import warnings

from django.conf import settings
from django.db import transaction
from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

from portfolio.models import MediaAsset, MediaMime


IMAGE_FORMATS = {"JPEG": (MediaMime.JPEG, "jpg"), "PNG": (MediaMime.PNG, "png"), "WEBP": (MediaMime.WEBP, "webp")}


@dataclass(frozen=True)
class DecodedImage:
    width: int
    height: int
    mime_type: str
    extension: str


def inspect_upload(upload):
    if upload.size > settings.MEDIA_UPLOAD_MAX_BYTES:
        raise ValidationError({"file": "This image exceeds the upload size limit."})
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(upload) as image:
                if image.format not in IMAGE_FORMATS:
                    raise ValidationError({"file": "Choose a JPEG, PNG, or WebP image."})
                mime_type, extension = IMAGE_FORMATS[image.format]
                width, height = image.size
                image.verify()
            upload.seek(0)
            with Image.open(upload) as image:
                image.load()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombWarning, Image.DecompressionBombError):
        raise ValidationError({"file": "This file is not a valid, safely decodable image."})
    finally:
        upload.seek(0)
    if upload.content_type != mime_type:
        raise ValidationError({"file": "The declared file type does not match the decoded image."})
    return DecodedImage(width=width, height=height, mime_type=mime_type, extension=extension)


def store_upload(upload, decoded, credit, source_url):
    asset = MediaAsset(width=decoded.width, height=decoded.height, mime_type=decoded.mime_type,
                       credit=credit, source_url=source_url)
    asset.file.save(f"{uuid4().hex}.{decoded.extension}", upload, save=False)
    try:
        with transaction.atomic():
            asset.save()
    except Exception:
        asset.file.delete(save=False)
        raise
    return asset
