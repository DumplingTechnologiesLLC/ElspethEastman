from django.urls import path
from portfolio.views.site import SiteAPIView
from portfolio.views.page import PageDetailAPIView
from portfolio.views.copy import CopyAPIView
from portfolio.views.collections import EyebrowAPIView, EyebrowDetailAPIView, TriviaAPIView, TriviaDetailAPIView
from portfolio.views.page_image import PageImageAPIView
from portfolio.views.reorder import ReorderAPIView
from portfolio.views.media import MediaAssetAPIView
from portfolio.views.content_entries import ContentEntryAPIView, ContentEntryDetailAPIView

app_name = "portfolio"
urlpatterns = [
    path("site/", SiteAPIView.as_view(), name="site"),
    path("pages/<int:page_id>/", PageDetailAPIView.as_view(), name="page-detail"),
    path("copy/", CopyAPIView.as_view(), name="copy"),
    path("page-images/", PageImageAPIView.as_view(), name="page-images"),
    path("eyebrows/", EyebrowAPIView.as_view(), name="eyebrows"),
    path("eyebrows/<int:item_id>/", EyebrowDetailAPIView.as_view(), name="eyebrow-detail"),
    path("trivia/", TriviaAPIView.as_view(), name="trivia"),
    path("trivia/<int:item_id>/", TriviaDetailAPIView.as_view(), name="trivia-detail"),
    path("collections/reorder/", ReorderAPIView.as_view(), name="reorder"),
    path("media-assets/", MediaAssetAPIView.as_view(), name="media-assets"),
    path("content-entries/", ContentEntryAPIView.as_view(), name="content-entries"),
    path("content-entries/<int:item_id>/", ContentEntryDetailAPIView.as_view(), name="content-entry-detail"),
]
