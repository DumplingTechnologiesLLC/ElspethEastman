from django.http.response import HttpResponseBadRequest, HttpResponseForbidden
from core.models import Affiliations, Contact, Experience, FooterStat, Project, Skills
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from rest_framework import viewsets, status
from rest_framework.response import Response
from core.serializers import (
    AffiliationSerializer, ContactSerializer, ExperienceSerializer, ExperienceCreationSerializer,
    FooterStatSerializer, ProjectSerializer, SkillsSerializer
)
from django.core.mail import send_mail
import re


class ContactViewSet(viewsets.ModelViewSet):
    model = Contact
    serializer_class = ContactSerializer
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({'message': "Success"})

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden('Forbidden')
        queryset = self.get_queryset()
        return Response(
            self.get_serializer(queryset, many=True).data,
        )


class SkillViewSet(viewsets.ModelViewSet):
    model = Skills
    serializer_class = SkillsSerializer

    def get_queryset(self):
        return self.model.objects.first()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        lookup = {}
        for field in self.model._meta.fields:
            if field.name == 'id':
                continue
            regex = re.compile(r'(?<=_)([a-zA-Z])')

            def to_upper(matchobj):
                return matchobj.group(0).upper()
            replaced_lowercase = re.sub(regex, to_upper, field.name)
            replaced_lowercase = replaced_lowercase.replace('_', ' ')

            title_case_field = replaced_lowercase[0].upper(
            ) + replaced_lowercase[1:]
            lookup[field.name] = title_case_field
            lookup[title_case_field] = field.name
        return Response({
            'data': self.get_serializer(queryset).data,
            'lookup': lookup
        })


class ProjectViewSet(viewsets.ModelViewSet):
    model = Project
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.all().order_by('id')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return Response(self.get_serializer(queryset, many=True).data,)


class PaginatedProjectViewSet(viewsets.ModelViewSet):
    model = Project
    serializer_class = ProjectSerializer
    PAGE_SIZE = 4

    def get_queryset(self):
        return Project.objects.all().order_by('id')

    def list(self, request, *args, **kwargs):
        if 'page' not in request.GET:
            return HttpResponseBadRequest('Page is required')
        try:
            int_page = int(request.GET.get('page'))
        except ValueError:
            return HttpResponseBadRequest('Page must be an integer')
        queryset = self.get_queryset()
        paginator = Paginator(queryset, self.PAGE_SIZE)
        page = paginator.page(int_page)
        return Response({
            'data': self.get_serializer(page, many=True).data,
            'pages': paginator.num_pages
        })


class FooterViewSet(viewsets.ModelViewSet):
    model = FooterStat
    serializer_class = FooterStatSerializer
    affiliation_class = AffiliationSerializer

    def get_queryset(self):
        return self.model.objects.all().order_by('id')

    def get_affiliation_queryset(self):
        return Affiliations.objects.all().order_by("id")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        affiliation_qs = self.get_affiliation_queryset()
        response_data = {
            'stats': self.get_serializer(queryset, many=True).data,
            'affiliations': self.affiliation_class(affiliation_qs, many=True).data
        }
        return Response(response_data)


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
        # TODO: Protect behind authentication and authorization
        data = request.data
        serializer = self.creation_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data={"message": "success"}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)