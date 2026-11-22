"""Versioned session and contact boundaries used by the portfolio client."""
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from core.views import ContactViewSet, logout_view, session_view

app_name = 'core_v2'
urlpatterns = [
    path('session/', session_view, name='session'),
    path('session/login/', obtain_auth_token, name='login'),
    path('session/logout/', logout_view, name='logout'),
    path('contact/', ContactViewSet.as_view({'post': 'create'}), name='contact'),
]
