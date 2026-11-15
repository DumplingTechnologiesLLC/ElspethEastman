from core.mixins import ProtectCUDWithTokenMixin
from rest_framework.views import APIView


class ContentAPIView(ProtectCUDWithTokenMixin, APIView):
    """Share the existing token boundary while preserving public content reads."""

    def handle_exception(self, exc):
        response = super().handle_exception(exc)
        if response.status_code == 400:
            response.data = {"detail": "Please correct the highlighted fields.", "fields": error_fields(response.data)}
        return response


def error_fields(errors, prefix=""):
    if isinstance(errors, dict):
        result = {}
        for key, value in errors.items():
            result.update(error_fields(value, f"{prefix}.{key}" if prefix else key))
        return result
    if isinstance(errors, list) and any(isinstance(value, (dict, list)) for value in errors):
        result = {}
        for index, value in enumerate(errors):
            result.update(error_fields(value, f"{prefix}.{index}"))
        return result
    messages = errors if isinstance(errors, list) else [errors]
    return {prefix or "non_field_errors": [str(message) for message in messages]}
