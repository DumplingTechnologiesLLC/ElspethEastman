# Development and deployment

Develop on a feature branch and open its pull request against `development`. GitHub runs the frontend tests and production build, then checks Django against PostgreSQL, applies migrations twice, and runs backend regression tests. Both `Frontend` and `Backend` must pass before integration. The checks use test-only credentials and no Heroku secrets.

Heroku creates a disposable Review App for the pull request after CI succeeds. Its database is provisioned separately, the existing data migrations provide sample content, and email goes to the console backend. Review Apps expire after one day of inactivity. Treat the URL as temporary and use example data when testing.

After integration, staging tracks `development` and waits for CI. Open its URL from the `elspetheastman-cicd` pipeline. Check the build and release logs when a deployment fails; a successful build can still have a failed migration release.

## Build and migration behavior

The Node buildpack runs before Python. The root build script installs the frontend with its frozen Yarn lock, compiles React, and writes the full Git commit to `/static/revision.json`. Python then collects the generated static files. Build output is ignored by Git; frontend edits need no manual bundle commit.

The `release` process runs `python manage.py migrate --noinput` on each release, including subsequent Review App updates. Keep migrations compatible with the previous application version. Data initialization must preserve content already edited through the CMS.

Staging and Review Apps set `DEPLOYMENT_ENV` and `EMAIL_BACKEND`. Configuration rejects a live email backend in those environments, including when `DEBUG=False`. Staging has its own database and no Mailgun key. Future uploaded media must also use separate non-production storage.

## Validate a deployed revision

Run `python scripts/smoke-deployment.py <preview-or-staging-url> <full-git-sha>` to verify the served revision, public/CMS routes, JavaScript bundles, and seeded APIs. Add `--contact` to submit a sample message to the console backend. The script rejects production's URL.

For local checks, install Python 3.11 dependencies from `requirements.txt`, use Node 22 and Yarn 1.22.22, then run:

```sh
yarn build
yarn --cwd public test --watchAll=false --runInBand
python manage.py collectstatic --noinput
python manage.py makemigrations --check --dry-run
python manage.py test --noinput
```

Supply `SECRET_KEY`, `CONTACT_EMAIL`, `DEFAULT_FROM_EMAIL`, and `DEFAULT_TO_EMAIL` in the environment. Use `DEBUG=False`, `DEPLOYMENT_ENV=ci`, and `EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend` for deployment-equivalent tests. `DATABASE_URL` selects PostgreSQL; without it, local development uses SQLite. `requirements.in` records compatible runtime ranges and `requirements.txt` freezes the complete tested dependency set. Regenerate the latter in a clean virtual environment when updating dependencies.

## Production release boundary

`master` remains at its existing revision and is locked against updates, including administrator pushes. This development setup makes no production deployment or configuration changes. The existing production GitHub auto-deploy binding remains configured for `master`.

A production release requires a separate, explicit operation: review the staging-tested commit, prepare a database backup and application rollback target, arrange the manual production deployment/promotion policy, and deliberately unlock the release branch. Never merge into `master` or push to the `heroku` Git remote as part of ordinary development. Application rollback does not restore database or uploaded-media state.
