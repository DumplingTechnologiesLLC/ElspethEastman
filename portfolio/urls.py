from django.urls import path
from portfolio.views.site import SiteAPIView
from portfolio.views.page import PageDetailAPIView

app_name = "portfolio"
urlpatterns = [
    path("site/", SiteAPIView.as_view(), name="site"),
    path("pages/<uuid:page_id>/", PageDetailAPIView.as_view(), name="page-detail"),
]
