"""Exercise deployment verification without sending network requests."""

from contextlib import nullcontext
from io import StringIO
import json
from pathlib import Path
import runpy
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import urlparse

from django.conf import settings
from django.test import SimpleTestCase


class DeploymentSmokeTests(SimpleTestCase):
    host = 'redesign-preview.herokuapp.com'
    commit = 'a' * 40

    def setUp(self):
        self.pages = [
            {'id': index, 'kind': kind, 'title': kind.title(),
             'slug': '' if kind == 'home' else 'voice-acting' if kind == 'voiceover' else kind,
             'primary_action': None}
            for index, kind in enumerate(['home', 'voiceover', 'music', 'streaming', 'press', 'bio'], 1)
        ]
        self.responses = {
            '/static/revision.json': {'commit': self.commit},
            '/api/site/': {'pages': self.pages},
            '/static/app.js': b'compiled application',
            '/api/contact-me/': {'message': 'Success'},
        }
        html = b'<div id="root"></div><script src="/static/app.js"></script>'
        for page in self.pages:
            path = '' if page['kind'] == 'home' else '/' + page['slug']
            self.responses[path or '/'] = html
            self.responses['/cms' + path] = html
            self.responses[f'/api/pages/{page["id"]}/'] = {'page': page}
        self.responses['/login'] = html
        for path in ['/api/skills/', '/api/experience/', '/api/footerstats/',
                     '/api/projects/list/', '/api/projects/paginated/?page=1']:
            self.responses[path] = []
        self.requests = []
        self.status = 200
        self.redirect = None

    def open(self, request, *, timeout):
        self.assertEqual(timeout, 30)
        self.requests.append(request)
        url = urlparse(request.full_url)
        path = url.path + ('?' + url.query if url.query else '')
        self.assertIn(path, self.responses, f'Unexpected deployment address: {path}')
        value = self.responses[path]
        payload = value if isinstance(value, bytes) else json.dumps(value).encode()
        return nullcontext(SimpleNamespace(
            status=self.status, url=self.redirect or request.full_url, read=lambda: payload,
        ))

    def run_smoke(self, *options, url=None, commit=None):
        output = StringIO()
        with patch('sys.argv', ['smoke-deployment.py', url or f'https://{self.host}', commit or self.commit, *options]), \
                patch('urllib.request.urlopen', side_effect=self.open), \
                patch('sys.stdout', output), patch('sys.stderr', StringIO()):
            runpy.run_path(Path(settings.BASE_DIR) / 'scripts/smoke-deployment.py', run_name='__main__')
        return output.getvalue()

    def test_checks_all_current_public_and_cms_routes_and_aggregates_without_writes(self):
        self.assertIn('PASS', self.run_smoke())
        paths = [urlparse(request.full_url).path for request in self.requests]
        self.assertIn('/voice-acting', paths)
        self.assertIn('/cms/voice-acting', paths)
        self.assertNotIn('/voiceover', paths)
        self.assertNotIn('/projects', paths)
        for page in self.pages:
            self.assertIn(f'/api/pages/{page["id"]}/', paths)
        self.assertTrue(all(request.get_method() == 'GET' for request in self.requests))

    def test_rejects_production_and_non_heroku_targets_before_any_optional_contact(self):
        for url in ['https://elspetheastman.herokuapp.com', 'https://elspetheastman.com', 'invalid']:
            with self.subTest(url=url), self.assertRaises(SystemExit):
                self.run_smoke('--contact', url=url)
        self.assertEqual(self.requests, [])

    def test_requires_an_exact_commit_before_making_requests(self):
        with self.assertRaises(SystemExit):
            self.run_smoke(commit='short')
        self.assertEqual(self.requests, [])

    def test_stops_on_a_stale_deployment_before_contact(self):
        self.responses['/static/revision.json'] = {'commit': 'b' * 40}
        with self.assertRaisesRegex(RuntimeError, 'Wrong deployed commit'):
            self.run_smoke('--contact')
        self.assertEqual(len(self.requests), 1)

    def test_requires_all_six_unique_page_kinds(self):
        for pages in [self.pages[:-1], [self.pages[0], *self.pages[:-1]]]:
            self.responses['/api/site/'] = {'pages': pages}
            with self.subTest(pages=pages), self.assertRaisesRegex(RuntimeError, 'six page kinds'):
                self.run_smoke()

    def test_detects_route_shell_and_compiled_script_failures(self):
        for html, message in [(b'No application', 'missing React root'), (b'<div id="root"></div>', 'missing compiled scripts')]:
            self.responses['/login'] = html
            with self.subTest(html=html), self.assertRaisesRegex(RuntimeError, message):
                self.run_smoke()

    def test_detects_an_aggregate_with_the_wrong_page_identity(self):
        self.responses['/api/pages/2/'] = {'page': self.pages[0]}
        with self.assertRaisesRegex(RuntimeError, 'page identity'):
            self.run_smoke()

    def test_rejects_http_failures_and_cross_host_responses(self):
        self.status = 503
        with self.assertRaisesRegex(RuntimeError, 'HTTP 503'):
            self.run_smoke()
        self.status = 200
        self.redirect = 'https://unexpected.invalid'
        with self.assertRaisesRegex(RuntimeError, 'Unexpected redirect'):
            self.run_smoke()

    def test_sends_one_explicit_console_contact_after_successful_reads(self):
        self.assertIn('console contact submission', self.run_smoke('--contact'))
        writes = [request for request in self.requests if request.get_method() == 'POST']
        self.assertEqual(len(writes), 1)
        self.assertEqual(json.loads(writes[0].data), {
            'name': 'CI deployment verification', 'email': 'ci@example.invalid',
            'message': f'Non-production smoke check for {self.commit}',
        })
        self.responses['/api/contact-me/'] = {'message': 'Not sent'}
        with self.assertRaisesRegex(RuntimeError, 'Contact submission failed'):
            self.run_smoke('--contact')
