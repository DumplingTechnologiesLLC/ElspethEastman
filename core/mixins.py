from django.core.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from datetime import timedelta
from django.utils import timezone


def retrieve_token(token):
    if token is None:
        return None
    prefix = "Token "
    return token[len(prefix):]


def retrieve_request_token(request):
    return retrieve_token(request.headers.get('Authorization', None))


def retrieve_request_db_token(request):
    request_token = retrieve_request_token(request)
    db_token = Token.objects.filter(key=request_token)
    if db_token.exists():
        return db_token.first()
    return None


class ProtectCUDWithTokenMixin:

    def dispatch(self, request, *args, **kwargs):
        if request.method != 'GET':
            request_token = retrieve_request_token(request)
            db_token = Token.objects.filter(key=request_token)
            if not db_token.exists():
                raise PermissionDenied
            if db_token.created < (timezone.now() - timedelta(days=1)):
                db_token.delete()
                raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
