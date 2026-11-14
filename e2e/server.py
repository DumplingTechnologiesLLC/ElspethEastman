"""Run the compiled application against the guarded E2E database."""

import os
import sys
from seed import initialize, reset

initialize()
from django.core.management import call_command

call_command('migrate', interactive=False, verbosity=0)
call_command('collectstatic', interactive=False, verbosity=0)
reset()
os.execv(sys.executable, [sys.executable, '-m', 'gunicorn', 'config.wsgi',
                        '--bind', '127.0.0.1:8765', '--workers', '1', '--threads', '2',
                        '--access-logfile', '-', '--error-logfile', '-'])
