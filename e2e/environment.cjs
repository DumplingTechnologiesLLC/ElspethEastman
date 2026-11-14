const path = require('node:path');

const root = path.resolve(__dirname, '..');
const python = process.env.E2E_PYTHON || 'python3';
const baseURL = 'http://127.0.0.1:8765';
const environment = {
  ...process.env,
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
  DATABASE_URL: process.env.E2E_DATABASE_URL || `sqlite:///${root}/.e2e/db.sqlite3`,
};

module.exports = { root, python, baseURL, environment };
