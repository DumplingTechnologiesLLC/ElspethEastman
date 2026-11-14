"""Own the disposable browser-test database; refuse other database targets."""

from datetime import timedelta
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def initialize():
    if os.environ.get('SECRET_KEY') != 'e2e-disposable-database-only' or os.environ.get('DEPLOYMENT_ENV') != 'ci':
        raise RuntimeError('Browser fixtures require the dedicated E2E environment')
    import django
    django.setup()
    from django.conf import settings
    database = settings.DATABASES['default']
    if database['ENGINE'] == 'django.db.backends.sqlite3':
        expected = (ROOT / '.e2e' / 'db.sqlite3').resolve()
        if Path(database['NAME']).resolve() != expected:
            raise RuntimeError('Refusing to reset a non-E2E SQLite database')
        expected.parent.mkdir(exist_ok=True)
    elif database['ENGINE'] == 'django.db.backends.postgresql':
        if database['HOST'] not in ('localhost', '127.0.0.1', 'postgres') or database['NAME'] != 'elspeth_e2e':
            raise RuntimeError('Refusing to reset a non-E2E PostgreSQL database')
    else:
        raise RuntimeError('Unsupported browser-test database')


def reset():
    from django.contrib.auth import get_user_model
    from django.core.management import call_command
    from core.models import Affiliations, Experience, FooterStat, Project, Skills
    call_command('flush', interactive=False, verbosity=0)
    get_user_model().objects.create_user('e2e-editor', password='e2e-only-password')
    Skills.objects.create(
        voice_acting='Voice acting fixture: characters, narration, and animation.',
        game_development='Game development fixture: music and interactive worlds.',
        streaming='Streaming fixture: games and community broadcasts.',
    )
    Project.objects.bulk_create([
        Project(uuid=index, title=f'Fixture Project {index}', src=f'e2e-video-{index}')
        for index in range(1, 7)
    ])
    Experience.objects.bulk_create([
        Experience(year=2020 + index, credit=f'Fixture {category}', category=category,
                   link=f'https://example.invalid/credit-{index}', tba=index == 4)
        for index, (category, _) in enumerate(Experience.CHOICES, 1)
    ])
    Affiliations.objects.create(affiliation='Fixture Studio', link='https://example.invalid/studio')
    FooterStat.objects.bulk_create([
        FooterStat(value='10+', label='Fixture games', percent=70),
        FooterStat(value='20+', label='Fixture voices', percent=80),
        FooterStat(value='30+', label='Fixture broadcasts', percent=90),
    ])


def inspect():
    from core.models import Affiliations, Contact, Experience, Project, Skills
    print(json.dumps({
        'contacts': list(Contact.objects.values('name', 'email', 'message', 'sent')),
        'projects': list(Project.objects.order_by('-uuid').values('id', 'title', 'src', 'uuid')),
        'skills': list(Skills.objects.values('voice_acting', 'game_development', 'streaming')),
        'experience': list(Experience.objects.values('id', 'credit', 'category', 'year', 'tba', 'link')),
        'affiliations': list(Affiliations.objects.values('id', 'affiliation', 'link')),
    }))


if __name__ == '__main__':
    initialize()
    command = sys.argv[1]
    if command == 'reset':
        reset()
    elif command == 'inspect':
        inspect()
    elif command == 'empty-projects':
        from core.models import Project
        Project.objects.all().delete()
    elif command == 'expire-tokens':
        from django.utils import timezone
        from rest_framework.authtoken.models import Token
        Token.objects.update(created=timezone.now() - timedelta(days=2))
    else:
        raise RuntimeError('Unknown fixture command')
