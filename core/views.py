from django.http.response import HttpResponseBadRequest, HttpResponseForbidden
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.views import View
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone

from rest_framework import viewsets, status, mixins
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.decorators import action
from rest_framework.response import Response
from core.mixins import ProtectCUDWithTokenMixin, retrieve_request_db_token

from core.models import Affiliations, Contact, Experience, FooterStat, Project, Skills
from core.serializers import (
    AffiliationSerializer, ContactSerializer, ExperienceSerializer, ExperienceCreationSerializer,
    FooterStatSerializer, ProjectSerializer, SkillsSerializer
)

import json
import re


def send_contact_email(contact):
    html_content = render_to_string('email.html', {'contact': contact})
    text_content = strip_tags(html_content)

    send_mail(
        f'Website Contact: {contact.name}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.DEFAULT_TO_EMAIL],
        message=text_content, html_message=html_content
    )

    contact.sent = True
    contact.date_sent = timezone.now()
    contact.save()


class ContactViewSet(
        mixins.CreateModelMixin,
        mixins.ListModelMixin,
        viewsets.GenericViewSet):
    model = Contact
    serializer_class = ContactSerializer
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        contact = serializer.save()
        send_contact_email(contact)
        return Response({'message': "Success"})

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden('Forbidden')
        queryset = self.get_queryset()
        return Response(
            self.get_serializer(queryset, many=True).data,
        )


class SkillViewSet(
    ProtectCUDWithTokenMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    model = Skills
    serializer_class = SkillsSerializer

    def get_queryset(self):
        return self.model.objects.first()

    def put(self, request,):
        raise MethodNotAllowed('PUT', detail='Use Patch')

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

    def patch(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        item = self.get_queryset()
        serializer = self.get_serializer(data=request.data, instance=item)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        item = serializer.save()
        return Response(self.get_serializer(item).data)


class ProjectViewSet(
        ProtectCUDWithTokenMixin,
        mixins.ListModelMixin,
        mixins.CreateModelMixin,
        mixins.UpdateModelMixin,
        mixins.DestroyModelMixin,
        viewsets.GenericViewSet):
    model = Project
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.all().order_by('-uuid')

    @action(detail=False, methods=['PATCH'], name='Update a group of projects at once')
    def batch_update(self, request):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        validated_serializers = []
        for item in request.data:
            try:
                django_item = self.model.objects.get(pk=item['id'])
            except Project.DoesNotExist:
                return Response({
                    'error': f'An item with id "{django_item.get("id", None)}" called "{django_item.get("title", "Title not found")}" does not exist'},
                    status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(django_item, data=item)
            if not serializer.is_valid():
                return Response({
                    'error': 'There was a problem with your submission.',
                    'errors': serializer.errors,
                    'id': item.get('id')
                }, status=status.HTTP_400_BAD_REQUEST)
            validated_serializers.append(serializer)
        for serializer in validated_serializers:
            serializer.save()
        return Response({'message': 'Success, all projects updated'})

    def put(self, request,):
        raise MethodNotAllowed('PUT', detail='Use Patch')

    def destroy(self, request, pk):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        project = get_object_or_404(Project, pk=pk)
        project.delete()
        return Response({'message': 'Success'})

    def create(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'There was a problem with your submission',
                'errors': serializer.errors,
                'id': -1}, status=status.HTTP_400_BAD_REQUEST)
        project = serializer.save()
        project.uuid = project.id
        project.save()
        return Response({'message': "Success", 'project': self.get_serializer(project).data})

    def patch(self, request, pk,):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        project = self.get_object(pk)
        serializer = self.get_serializer(project, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        item = serializer.save()
        return Response(self.get_serializer(item).data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return Response(self.get_serializer(queryset, many=True).data,)


class PaginatedProjectViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    model = Project
    serializer_class = ProjectSerializer
    PAGE_SIZE = 4

    def get_queryset(self):
        return Project.objects.all().order_by('-uuid')

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


class FooterViewSet(
        mixins.ListModelMixin,
        viewsets.GenericViewSet):
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


class AffiliationViewSet(
    ProtectCUDWithTokenMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = AffiliationSerializer
    model = Affiliations

    def get_queryset(self):
        return Affiliations.objects.all().order_by("id")

    def put(self, request,):
        raise MethodNotAllowed('PUT', detail='Use Patch')

    def destroy(self, request, pk):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        project = get_object_or_404(Affiliations, pk=pk)
        project.delete()
        return Response({'message': 'Success'})

    def create(self, request, *args, **kwargs):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        project = serializer.save()
        return Response(self.get_serializer(project).data)

    def patch(self, request, pk,):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        affiliation = get_object_or_404(Affiliations, pk=pk)
        serializer = self.get_serializer(affiliation, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        item = serializer.save()
        return Response(self.get_serializer(item).data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return Response(self.get_serializer(queryset, many=True).data,)


class ExperienceViewSet(
        ProtectCUDWithTokenMixin,
        mixins.ListModelMixin,
        mixins.CreateModelMixin,
        mixins.RetrieveModelMixin,
        mixins.DestroyModelMixin,
        viewsets.GenericViewSet):
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
        exp = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(exp)
        return Response(serializer.data)

    def patch(self, request, pk,):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        project = get_object_or_404(self.model, pk=pk)
        serializer = self.creation_serializer(project, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        item = serializer.save()
        return Response(data={'object': self.get_serializer(item).data}, status=status.HTTP_200_OK)

    def put(self, request,):
        raise MethodNotAllowed('PUT', detail='Use Patch')

    def destroy(self, request, pk):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        experience = get_object_or_404(self.model, pk=pk)
        experience.delete()
        return Response({'message': 'Success'})

    def create(self, request):
        # if not request.user.is_authenticated:
        #     return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        serializer = self.creation_serializer(data=data)
        if serializer.is_valid():
            exp = serializer.save()
            return Response(data={"object": self.get_serializer(exp).data}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Client(View):

    def get(self, request):
        return render(request, 'build/index.html', {})


class AuthenticatedClient(LoginRequiredMixin, View):
    redirect_field_name = 'redirect_to'
    login_url = '/login/'

    def get(self, request):
        return render(request, 'build/index.html', {})


# @require_POST
# def login_view(request):
#     data = json.loads(request.body)
#     username = data.get('username')
#     password = data.get('password')

#     if username is None or password is None:
#         return JsonResponse({'detail': 'Please provide username and password.'}, status=status.HTTP_400_BAD_REQUEST)

#     user = authenticate(username=username, password=password)

#     if user is None:
#         return JsonResponse({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

#     login(request, user)
#     return JsonResponse({'detail': 'Successfully logged in.'})


def logout_view(request):
    token = retrieve_request_db_token(request)
    if token is None:
        return JsonResponse({'detail': 'You\'re not logged in.'}, status=status.HTTP_400_BAD_REQUEST)
    token.delete()
    return JsonResponse({'detail': 'Successfully logged out.'})


@ensure_csrf_cookie
def session_view(request):
    token = retrieve_request_db_token(request)
    if token is None:
        return JsonResponse({'isAuthenticated': False})
    token.created = timezone.now()
    token.save()
    return JsonResponse({'isAuthenticated': True})
