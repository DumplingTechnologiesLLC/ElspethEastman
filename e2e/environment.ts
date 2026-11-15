import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const python = process.env.E2E_PYTHON || 'python3';
const baseURL = 'http://127.0.0.1:8765';
const environment = {
  ...Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ),
  DJANGO_SETTINGS_MODULE: 'config.settings',
  SECRET_KEY: 'e2e-disposable-database-only',
  DEBUG: 'False',
  HEROKU: 'False',
  SSL_REDIRECT: 'False',
  DEPLOYMENT_ENV: 'ci',
  EMAIL_BACKEND: 'django.core.mail.backends.console.EmailBackend',
  CONTACT_EMAIL: 'e2e@example.invalid',
  DEFAULT_FROM_EMAIL: 'e2e@example.invalid',
  DEFAULT_TO_EMAIL: 'e2e@example.invalid',
  PYTHONDONTWRITEBYTECODE: '1',
  DATABASE_URL:
    process.env.E2E_DATABASE_URL || `sqlite:///${root}/.e2e/db.sqlite3`,
};

export { root, python, baseURL, environment };
