# Elspeth Eastman

Elspeth Eastman's portfolio combines a React client with a Django API and a small content-management interface. The client builds with Vite and StyleX; Django serves the compiled application and static assets.

Use Node 22.22.3, pnpm 12.18.0, Python 3.11, and Poetry 2.5.1. Corepack selects the pnpm version from `package.json`. Install Poetry in its own environment with `pipx install poetry==2.5.1`.

```sh
corepack enable
pnpm install --frozen-lockfile
poetry sync
```

Set `SECRET_KEY`, `CONTACT_EMAIL`, `DEFAULT_FROM_EMAIL`, and `DEFAULT_TO_EMAIL`. For local testing, use `DEBUG=False`, `HEROKU=False`, `DEPLOYMENT_ENV=ci`, and `EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend`. Set `DATABASE_URL` for a disposable PostgreSQL database, or omit it to use local SQLite.

```sh
pnpm build
poetry run python manage.py migrate
poetry run python manage.py collectstatic --noinput
poetry run python manage.py runserver
```

For client development, run Django on port 8000 and `pnpm dev` in a second terminal. Vite proxies `/api` to Django. The HTTP adapter obtains Django's CSRF cookie before the first write when the Vite page starts with a fresh browser session. `pnpm storybook` opens isolated presentation components on port 6006.

Run the required checks before opening a PR:

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:coverage
poetry run coverage run manage.py test --noinput
poetry run coverage report
pnpm storybook:build
pnpm test:e2e:docker
```

TypeScript unit coverage requires 100% statements, branches, functions, and lines per file. Django requires 100% statements and branches across application code, configuration, migrations, and entrypoints. The browser suite exercises the six redesigned public/CMS pages and compares Linux visual baselines while retaining historical API snapshots.

Read [the browser-test guide](e2e/README.md) for regression scenarios and [the deployment workflow](DEPLOYMENT.md) for PR previews and staging.
