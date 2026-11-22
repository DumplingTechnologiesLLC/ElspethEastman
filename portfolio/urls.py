from django.urls import path
from portfolio.views.site import SiteAPIView
from portfolio.views.page import PageDetailAPIView
from portfolio.views.copy import CopyAPIView
from portfolio.views.collections import EyebrowAPIView, EyebrowDetailAPIView, TriviaAPIView, TriviaDetailAPIView
from portfolio.views.page_image import PageImageAPIView
from portfolio.views.reorder import ReorderAPIView
from portfolio.views.media import MediaAssetAPIView
from portfolio.views.content_entries import ContentEntryAPIView, ContentEntryDetailAPIView
from portfolio.views.feature import FeaturedItemAPIView
from portfolio.views.music import MusicFeatureAPIView, MusicReleaseAPIView, MusicReleaseDetailAPIView
from portfolio.views.page_collections import (AppearanceAPIView, AppearanceDetailAPIView, BioChapterAPIView, BioChapterDetailAPIView,
                                              CurrentItemAPIView, CurrentItemDetailAPIView, StreamClipAPIView, StreamClipDetailAPIView)

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
    path("media/assets/", MediaAssetAPIView.as_view(), name="media-assets"),
    path("content/entries/", ContentEntryAPIView.as_view(), name="content-entries"),
    path("content/entries/<uuid:item_id>/", ContentEntryDetailAPIView.as_view(), name="content-entry-detail"),
    path("content/features/", FeaturedItemAPIView.as_view(), name="featured-items"),
    path("music/features/", MusicFeatureAPIView.as_view(), name="music-features"),
    path("music/releases/", MusicReleaseAPIView.as_view(), name="music-releases"),
    path("music/releases/<uuid:item_id>/", MusicReleaseDetailAPIView.as_view(), name="music-release-detail"),
    path("streaming/clips/", StreamClipAPIView.as_view(), name="stream-clips"),
    path("streaming/clips/<uuid:item_id>/", StreamClipDetailAPIView.as_view(), name="stream-clip-detail"),
    path("press/appearances/", AppearanceAPIView.as_view(), name="appearances"),
    path("press/appearances/<uuid:item_id>/", AppearanceDetailAPIView.as_view(), name="appearance-detail"),
    path("bio/chapters/", BioChapterAPIView.as_view(), name="bio-chapters"),
    path("bio/chapters/<uuid:item_id>/", BioChapterDetailAPIView.as_view(), name="bio-chapter-detail"),
    path("bio/current/", CurrentItemAPIView.as_view(), name="current-items"),
    path("bio/current/<uuid:item_id>/", CurrentItemDetailAPIView.as_view(), name="current-item-detail"),
]
