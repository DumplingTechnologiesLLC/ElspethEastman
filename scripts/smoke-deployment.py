"""Verify an isolated Heroku deployment against its expected Git commit."""

import argparse
import json
import re
from urllib.parse import urlparse
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('url')
parser.add_argument('commit')
parser.add_argument('--contact', action='store_true', help='Send one test contact to the non-production console backend')
args = parser.parse_args()
host = urlparse(args.url).hostname or ''
if not host.endswith('.herokuapp.com') or host == 'elspetheastman.herokuapp.com':
    parser.error('Only non-production herokuapp.com URLs are accepted')
if not re.fullmatch('[a-f0-9]{40}', args.commit):
    parser.error('A full expected Git commit is required')
base = args.url.rstrip('/')


def request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = Request(base + path, data=data, headers={'Content-Type': 'application/json'})
    with urlopen(req, timeout=30) as response:
        if urlparse(response.url).hostname != host:
            raise RuntimeError('Unexpected redirect to a different host')
        if response.status != 200:
            raise RuntimeError(f'{path}: HTTP {response.status}')
        return response.read()


revision = json.loads(request('/static/revision.json'))
if revision['commit'] != args.commit:
    raise RuntimeError(f'Wrong deployed commit: {revision["commit"]}')
for path in ['/', '/projects', '/cms', '/login']:
    html = request(path).decode()
    if '<div id="root">' not in html:
        raise RuntimeError(f'{path}: missing React root')
    scripts = re.findall(r'src="(/static/[^\"]+\.js)"', html)
    if not scripts:
        raise RuntimeError(f'{path}: missing compiled scripts')
    for asset in scripts:
        request(asset)
for path in ['/api/skills/', '/api/experience/', '/api/footerstats/',
             '/api/projects/list/', '/api/projects/paginated/?page=1']:
    json.loads(request(path))
if args.contact:
    result = json.loads(request('/api/contact-me/', {
        'name': 'CI deployment verification', 'email': 'ci@example.invalid',
        'message': f'Non-production smoke check for {args.commit}',
    }))
    if result != {'message': 'Success'}:
        raise RuntimeError('Contact submission failed')
print(f'PASS {host}: commit, public/CMS routes, compiled assets, seeded APIs'
      + (', console contact submission' if args.contact else ''))
