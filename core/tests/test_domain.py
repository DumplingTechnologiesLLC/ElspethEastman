"""Model, serializer, and API contracts independent of the browser client."""
import builtins
import importlib
import json
import os
from pathlib import Path
import runpy
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.http import HttpRequest
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.test import APIRequestFactory, force_authenticate

from core import admin, mixins, views
from core.models import Affiliations, Contact, Experience, FooterStat, Project, Skills
from core.serializers import SkillsSerializer


class DomainTests(TestCase):
    def test_model_display_and_persistence(self):
        contact = Contact.objects.create(name='Visitor', email='visitor@example.invalid', message='Hello')
        created = contact.date_created
        contact.message = 'Updated'
        contact.save()
        self.assertEqual(contact.date_created, created)
        self.assertEqual(str(contact), 'Visitor - visitor@example.invalid')
        for tba, year, display in [(True, 2021, 'TBA'), (False, 2021, '2021'), (False, None, '')]:
            experience = Experience(credit='Credit', category=Experience.VOICE_CREDITS, tba=tba, year=year)
            self.assertEqual(str(experience), f'Voice Credits: {display} Credit')
        self.assertEqual(str(FooterStat(value='10+', label='Credits', percent=70)), '10+ Credits | 70%')
        self.assertEqual(str(Affiliations(affiliation='Studio')), 'Studio')
        project = Project.objects.create(title='Project', src='video')
        self.assertIsNone(project.uuid)
        project.save()
        self.assertEqual(project.uuid, project.id)
        project.uuid = 99
        project.save()
        self.assertEqual(project.uuid, 99)
        self.assertEqual(str(project), 'Project')

    def test_skills_validation_requires_every_field(self):
        valid = {'game_development': 'Games', 'streaming': 'Streams', 'voice_acting': 'Voice'}
        serializer = SkillsSerializer()
        for key in valid:
            for value in [None, '']:
                with self.subTest(key=key, value=value), self.assertRaises(Exception):
                    serializer.validate({**valid, key: value})
        self.assertEqual(serializer.validate(valid), valid)

    def test_resend_admin_action_and_no_selection(self):
        contacts = [Contact(name='A'), Contact(name='B')]
        with patch('core.admin.send_contact_email') as send:
            admin.resend(None, None, contacts)
            self.assertEqual(send.call_count, 2)
            admin.resend(None, None, [])
            self.assertEqual(send.call_count, 2)

    def test_token_helpers_accept_missing_and_unknown_authorization(self):
        self.assertIsNone(mixins.retrieve_token(None))
        self.assertEqual(mixins.retrieve_token('Token abc'), 'abc')
        self.assertIsNone(mixins.retrieve_request_db_token(HttpRequest()))


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ApiContractTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('unit-editor', password='unit-password')
        self.client.force_login(self.user)
        response = self.client.post('/api/session/login/', {'username': 'unit-editor', 'password': 'unit-password'})
        self.token = response.json()['token']
        self.headers = {'HTTP_AUTHORIZATION': f'Token {self.token}'}

    def send(self, method, path, data=None):
        return getattr(self.client, method)(path, data=json.dumps(data), content_type='application/json', **self.headers)

    def test_skills_update_validation_and_missing_required_fields(self):
        valid = {'game_development': 'Games', 'streaming': 'Streams', 'voice_acting': 'Voice'}
        self.assertEqual(self.send('patch', '/api/skills/', {}).status_code, 400)
        response = self.send('patch', '/api/skills/', valid)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), valid)

    def test_projects_crud_and_bulk_validation(self):
        self.assertEqual(self.send('post', '/api/projects/list/', {}).status_code, 400)
        response = self.send('post', '/api/projects/list/', {'title': 'New project', 'src': 'video'})
        self.assertEqual(response.status_code, 200)
        project = response.json()['project']
        self.assertEqual(self.send('patch', '/api/projects/list/batch_update/', [{**project, 'title': ''}]).status_code, 400)
        self.assertEqual(self.send('patch', '/api/projects/list/batch_update/', [{**project, 'title': 'Updated'}]).status_code, 200)
        self.assertEqual(Project.objects.get(id=project['id']).title, 'Updated')
        self.assertEqual(self.send('patch', f'/api/projects/list/{project["id"]}/', {'title': '', 'src': ''}).status_code, 400)
        self.assertEqual(self.send('patch', f'/api/projects/list/{project["id"]}/', {'title': 'Detail', 'src': 'new'}).status_code, 200)
        self.assertEqual(self.send('delete', f'/api/projects/list/{project["id"]}/').status_code, 200)
        self.assertFalse(Project.objects.filter(id=project['id']).exists())

    def test_project_pagination_validates_query(self):
        response = self.client.get('/api/projects/paginated/')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content, b'Page is required')
        response = self.client.get('/api/projects/paginated/?page=no')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.content, b'Page must be an integer')

    def test_affiliation_crud_validation_and_list(self):
        self.assertEqual(self.client.get('/api/affiliations/').status_code, 200)
        self.assertEqual(self.send('post', '/api/affiliations/', {}).status_code, 400)
        response = self.send('post', '/api/affiliations/', {'affiliation': 'New studio', 'link': ''})
        affiliation = response.json()
        path = f'/api/affiliations/{affiliation["id"]}/'
        self.assertEqual(self.send('patch', path, {'affiliation': ''}).status_code, 400)
        self.assertEqual(self.send('patch', path, {'affiliation': 'Edited studio', 'link': 'https://example.invalid'}).status_code, 200)
        self.assertEqual(self.send('delete', path).status_code, 200)
        self.assertFalse(Affiliations.objects.filter(id=affiliation['id']).exists())

    def test_experience_crud_and_all_year_formats(self):
        data = {'category': Experience.VOICE_CREDITS, 'credit': 'Credit', 'year': None, 'link': '', 'tba': False}
        self.assertEqual(self.send('post', '/api/experience/', {}).status_code, 400)
        response = self.send('post', '/api/experience/', data)
        experience = response.json()['object']
        self.assertEqual(experience['year'], '')
        path = f'/api/experience/{experience["id"]}/'
        self.assertEqual(self.client.get(path).json(), experience)
        self.assertEqual(self.send('patch', path, {}).status_code, 400)
        response = self.send('patch', path, {**data, 'year': 2026})
        self.assertEqual(response.json()['object']['year'], '(2026)')
        response = self.send('patch', path, {**data, 'tba': True})
        self.assertEqual(response.json()['object']['year'], '(TBA)')
        self.assertEqual(self.send('delete', path).status_code, 200)
        self.assertFalse(Experience.objects.filter(id=experience['id']).exists())

    def test_session_validation_and_missing_logout(self):
        self.assertTrue(self.send('post', '/api/session/').json()['isAuthenticated'])
        self.assertEqual(self.send('post', '/api/session/logout/').status_code, 200)
        self.assertFalse(self.send('post', '/api/session/').json()['isAuthenticated'])
        self.assertEqual(self.send('post', '/api/session/logout/').status_code, 400)

    def test_contact_list_rejects_anonymous_and_serializes_a_provided_queryset(self):
        self.client.logout()
        self.assertEqual(self.client.get('/api/contact-me/').status_code, 403)
        factory = APIRequestFactory()
        request = factory.get('/api/contact-me/')
        force_authenticate(request, self.user)
        contacts = [Contact(name='Visitor', email='visitor@example.invalid', message='Hello')]
        with patch.object(views.ContactViewSet, 'get_queryset', return_value=contacts):
            response = views.ContactViewSet.as_view({'get': 'list'})(request)
        self.assertEqual(response.data[0]['name'], 'Visitor')

    def test_explicit_put_handlers_require_patch(self):
        for view in [views.SkillViewSet, views.ProjectViewSet, views.AffiliationViewSet, views.ExperienceViewSet]:
            with self.subTest(view=view), self.assertRaises(MethodNotAllowed):
                view().put(APIRequestFactory().put('/'))

    def test_project_patch_handler_accepts_its_object_lookup_and_rejects_invalid_data(self):
        project = Project.objects.create(title='Original', src='video')
        view = views.ProjectViewSet()
        view.format_kwarg = None
        view.request = APIRequestFactory().patch('/')
        view.get_object = Mock(return_value=project)
        for data, status in [({'title': '', 'src': ''}, 400), ({'title': 'Updated', 'src': 'new'}, 200)]:
            view.request.data = data
            response = view.patch(view.request, project.id)
            self.assertEqual(response.status_code, status)

    def test_legacy_missing_bulk_item_error_remains_characterized(self):
        with self.assertRaises(UnboundLocalError):
            self.send('patch', '/api/projects/list/batch_update/', [{'id': 999999, 'title': 'Missing', 'src': 'video'}])

    def test_authenticated_client_renders_with_a_session(self):
        request = APIRequestFactory().get('/cms')
        request.user = self.user
        response = views.AuthenticatedClient.as_view()(request)
        self.assertEqual(response.status_code, 200)


class ConfigurationTests(SimpleTestCase):
    def settings(self, **variables):
        with patch.dict(os.environ, {'SECRET_KEY': 'unit-secret', 'CONTACT_EMAIL': 'test@example.invalid', 'DEFAULT_FROM_EMAIL': 'test@example.invalid', 'DEFAULT_TO_EMAIL': 'test@example.invalid', 'EMAIL_BACKEND': 'django.core.mail.backends.locmem.EmailBackend', 'DEPLOYMENT_ENV': 'ci', **variables}):
            return runpy.run_path('config/settings.py')

    def test_debug_and_hosted_configuration(self):
        debug = self.settings(DEBUG='True', HEROKU='False')
        self.assertIn('corsheaders.middleware.CorsMiddleware', debug['MIDDLEWARE'])
        hosted = self.settings(DEBUG='False', HEROKU='True', DATABASE_URL='postgres://user:password@localhost:5432/unit')
        self.assertEqual(hosted['DATABASES']['default']['OPTIONS']['sslmode'], 'require')
        self.assertEqual(hosted['DATABASES']['default']['CONN_MAX_AGE'], 600)
        with self.assertRaisesRegex(ValueError, 'Heroku deployments require a Postgres'):
            self.settings(DEBUG='False', HEROKU='True', DATABASE_URL='sqlite:///:memory:')

    def test_nonproduction_email_guard(self):
        with self.assertRaisesRegex(ValueError, 'Non-production deployments require'):
            self.settings(DEBUG='False', HEROKU='False', EMAIL_BACKEND='anymail.backends.mailgun.EmailBackend')
        self.assertEqual(self.settings(DEBUG='False', HEROKU='False', DEPLOYMENT_ENV='development', EMAIL_BACKEND='anymail.backends.mailgun.EmailBackend')['EMAIL_BACKEND'], 'anymail.backends.mailgun.EmailBackend')

    def test_wsgi_entrypoint(self):
        module = importlib.import_module('config.wsgi')
        self.assertTrue(callable(module.application))

    def test_management_entrypoints_and_missing_django(self):
        with patch('django.core.management.execute_from_command_line') as execute:
            runpy.run_path('manage.py', run_name='__main__')
            self.assertEqual(execute.call_count, 1)
        module = runpy.run_path('manage.py')
        original_import = builtins.__import__
        def missing(name, *args, **kwargs):
            if name == 'django.core.management':
                raise ImportError('Django unavailable')
            return original_import(name, *args, **kwargs)
        with patch('builtins.__import__', side_effect=missing), self.assertRaisesRegex(ImportError, "Couldn't import Django"):
            module['main']()
