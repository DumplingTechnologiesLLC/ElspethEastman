from django.conf import settings
from django.http import Http404
from django.views.static import serve


def local_media(request, path):
    """Serve temporary local/review uploads; persistent deployments use storage URLs."""
    if settings.DEPLOYMENT_ENV in ("production", "staging"):
        raise Http404("Media is served by persistent storage.")
    return serve(request, path, document_root=settings.MEDIA_ROOT)
