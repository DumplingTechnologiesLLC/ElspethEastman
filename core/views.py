from core.models import Experience
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from core.serializers import ExperienceSerializer, ExperienceCreationSerializer


class ExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = ExperienceSerializer
    creation_serializer = ExperienceCreationSerializer
    model = Experience

    def get_queryset(self):
        groups = {}
        for choice in self.model.CHOICES:
            groups[choice[0]] = self.model.objects.filter(category=choice[0])
        return groups

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serialized_groups = {}
        for category, qs in queryset.items():
            serialized_groups[category] = self.get_serializer(
                qs, many=True).data
        return Response(serialized_groups)

    def retrieve(self, request, pk=None):
        queryset = self.model.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def create(self, request):
        data = request.data
        serializer = self.creation_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data={"message": "success"}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
