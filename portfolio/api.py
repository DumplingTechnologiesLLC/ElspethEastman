from core.mixins import ProtectCUDWithTokenMixin
from rest_framework.views import APIView


class ContentAPIView(ProtectCUDWithTokenMixin, APIView):
    """Share the existing token boundary while preserving public content reads."""
