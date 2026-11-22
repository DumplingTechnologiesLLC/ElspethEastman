from django.urls import path
from portfolio.views.site import SiteAPIView
from portfolio.views.page import PageDetailAPIView
from portfolio.views.copy import CopyAPIView
from portfolio.views.collections import EyebrowAPIView, EyebrowDetailAPIView, TriviaAPIView, TriviaDetailAPIView
from portfolio.views.page_image import PageImageAPIView
from portfolio.views.reorder import ReorderAPIView
from portfolio.views.media import MediaAssetAPIView

app_name = "portfolio"
urlpatterns = [
    path("site/", SiteAPIView.as_view(), name="site"),
    path("pages/<uuid:page_id>/", PageDetailAPIView.as_view(), name="page-detail"),
    path("pages/copy/", CopyAPIView.as_view(), name="copy"),
    path("pages/images/", PageImageAPIView.as_view(), name="page-images"),
    path("pages/eyebrows/", EyebrowAPIView.as_view(), name="eyebrows"),
    path("pages/eyebrows/<uuid:item_id>/", EyebrowDetailAPIView.as_view(), name="eyebrow-detail"),
    path("pages/trivia/", TriviaAPIView.as_view(), name="trivia"),
    path("pages/trivia/<uuid:item_id>/", TriviaDetailAPIView.as_view(), name="trivia-detail"),
    path("collections/reorder/", ReorderAPIView.as_view(), name="reorder"),
    path("media-assets/", MediaAssetAPIView.as_view(), name="media-assets"),
]
