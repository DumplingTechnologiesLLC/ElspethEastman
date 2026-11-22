"""Guarded browser harness with deterministic console-mail identity."""

from e2e.seed import initialize

initialize()

import django.core.mail.message as email_message
from django.core.wsgi import get_wsgi_application

# Console-only fixture mail must not depend on the workstation's reverse DNS.
email_message.DNS_NAME = "e2e.invalid"
application = get_wsgi_application()
