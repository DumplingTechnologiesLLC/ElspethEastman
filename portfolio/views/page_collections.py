from portfolio.models import Appearance, BioChapter, CurrentItem, PageKind, StreamClip
from portfolio.serializers.appearance import AppearanceCreateSerializer, AppearancePatchSerializer, AppearanceSerializer
from portfolio.serializers.bio_chapter import BioChapterCreateSerializer, BioChapterPatchSerializer, BioChapterSerializer
from portfolio.serializers.current_item import CurrentItemCreateSerializer, CurrentItemPatchSerializer, CurrentItemSerializer
from portfolio.serializers.stream_clip import StreamClipCreateSerializer, StreamClipPatchSerializer, StreamClipSerializer
from portfolio.services.owned_collections import OwnedCollection
from portfolio.views.collections import OwnedCollectionAPIView, OwnedCollectionDetailAPIView


class StreamClipSettings:
    collection = OwnedCollection(StreamClip, PageKind.STREAMING)
    create_serializer = StreamClipCreateSerializer
    patch_serializer = StreamClipPatchSerializer
    read_serializer = StreamClipSerializer


class AppearanceSettings:
    collection = OwnedCollection(Appearance, PageKind.PRESS)
    create_serializer = AppearanceCreateSerializer
    patch_serializer = AppearancePatchSerializer
    read_serializer = AppearanceSerializer


class BioChapterSettings:
    collection = OwnedCollection(BioChapter, PageKind.BIO)
    create_serializer = BioChapterCreateSerializer
    patch_serializer = BioChapterPatchSerializer
    read_serializer = BioChapterSerializer


class CurrentItemSettings:
    collection = OwnedCollection(CurrentItem, PageKind.BIO)
    create_serializer = CurrentItemCreateSerializer
    patch_serializer = CurrentItemPatchSerializer
    read_serializer = CurrentItemSerializer


class StreamClipAPIView(StreamClipSettings, OwnedCollectionAPIView):
    pass


class StreamClipDetailAPIView(StreamClipSettings, OwnedCollectionDetailAPIView):
    pass


class AppearanceAPIView(AppearanceSettings, OwnedCollectionAPIView):
    pass


class AppearanceDetailAPIView(AppearanceSettings, OwnedCollectionDetailAPIView):
    pass


class BioChapterAPIView(BioChapterSettings, OwnedCollectionAPIView):
    pass


class BioChapterDetailAPIView(BioChapterSettings, OwnedCollectionDetailAPIView):
    pass


class CurrentItemAPIView(CurrentItemSettings, OwnedCollectionAPIView):
    pass


class CurrentItemDetailAPIView(CurrentItemSettings, OwnedCollectionDetailAPIView):
    pass
