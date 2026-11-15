from datetime import timedelta
import json
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from core.models import Contact, Experience


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class DeploymentRegressionTests(TestCase):
    def test_public_routes_render_the_built_client(self):
        for path in ['/', '/projects', '/cms', '/login']:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertContains(response, '<div id="root">')

    def test_seeded_content_is_readable_without_authentication(self):
        for path in ['/api/skills/', '/api/experience/', '/api/footerstats/',
                     '/api/projects/list/', '/api/projects/paginated/?page=1']:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertIsNotNone(response.json())

    def test_deployment_serves_the_compiled_assets_and_revision(self):
        from django.conf import settings
        from pathlib import Path
        manifest = json.loads((Path(settings.BASE_DIR) / 'public/build/asset-manifest.json').read_text())
        asset = self.client.get(manifest['files']['main.js'])
        self.assertEqual(asset.status_code, 200)
        revision = self.client.get('/static/revision.json')
        self.assertEqual(revision.status_code, 200)
        body = b''.join(revision.streaming_content)
        self.assertRegex(json.loads(body)['commit'], r'^[a-f0-9]{40}$')

    def test_anonymous_content_writes_are_rejected(self):
        before = Experience.objects.count()
        response = self.client.post('/api/experience/', {'credit': 'Unauthorized'})
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Experience.objects.count(), before)

    def test_expired_tokens_cannot_write(self):
        user = get_user_model().objects.create_user('expired-editor')
        token = Token.objects.create(user=user)
        Token.objects.filter(pk=token.pk).update(created=timezone.now() - timedelta(days=2))
        response = self.client.post('/api/experience/', {}, HTTP_AUTHORIZATION=f'Token {token.key}')
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Token.objects.filter(pk=token.pk).exists())

    def test_login_write_and_logout(self):
        get_user_model().objects.create_user('ci-editor', password='ci-test-password')
        login = self.client.post('/api/session/login/', {'username': 'ci-editor', 'password': 'ci-test-password'})
        self.assertEqual(login.status_code, 200)
        token = login.json()['token']
        response = self.client.post('/api/experience/', {
            'credit': 'CI staging credit', 'category': Experience.VOICE_CREDITS,
            'year': 2026, 'tba': False,
        }, HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Experience.objects.filter(credit='CI staging credit').exists())
        logout = self.client.post('/api/session/logout/', HTTP_AUTHORIZATION=f'Token {token}')
        self.assertEqual(logout.status_code, 200)
        self.assertFalse(Token.objects.filter(key=token).exists())

    def test_valid_contact_is_persisted_and_sent_to_test_backend(self):
        response = self.client.post('/api/contact-me/', {
            'name': 'CI visitor', 'email': 'visitor@example.invalid', 'message': 'Deployment test',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'message': 'Success'})
        contact = Contact.objects.get(email='visitor@example.invalid')
        self.assertTrue(contact.sent)
        self.assertIsNotNone(contact.date_sent)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Deployment test', mail.outbox[0].body)

    def test_invalid_contact_is_not_sent_or_saved(self):
        response = self.client.post('/api/contact-me/', {'name': 'CI visitor', 'email': 'invalid'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())
        self.assertEqual(Contact.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)


class NonProductionConfigurationTests(SimpleTestCase):
    def test_live_email_backend_is_rejected_in_staging(self):
        import os
        import subprocess
        import sys
        result = subprocess.run([sys.executable, '-c', 'import config.settings'], capture_output=True, text=True, env={
            **os.environ, 'DEPLOYMENT_ENV': 'staging',
            'EMAIL_BACKEND': 'anymail.backends.mailgun.EmailBackend',
        })
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Non-production deployments require a console or in-memory email backend', result.stderr)
