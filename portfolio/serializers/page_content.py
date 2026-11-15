from rest_framework import serializers
from .page import PageDescriptorSerializer
from .copy import CopyBlockSerializer
from .page_image import PageImageSerializer
from .eyebrow import EyebrowSerializer
from .trivia import TriviaSerializer


class PageContentSerializer(serializers.Serializer):
    page = PageDescriptorSerializer(source="*")
    copy = CopyBlockSerializer(many=True)
    images = PageImageSerializer(many=True)
    eyebrows = EyebrowSerializer(many=True)
    trivia = TriviaSerializer(many=True)
