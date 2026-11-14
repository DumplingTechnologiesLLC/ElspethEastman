# Development and deployment

Develop on a feature branch and open its pull request against `development`. GitHub runs the frontend tests and production build, then checks Django against PostgreSQL, applies migrations twice, and runs backend regression tests. Both `Frontend` and `Backend` must pass before integration. The checks use test-only credentials and no Heroku secrets.

Heroku creates a disposable Review App for the pull request after CI succeeds. Its database is provisioned separately, the existing data migrations provide sample content, and email goes to the console backend. Review Apps expire after one day of inactivity. Treat the URL as temporary and use example data when testing.

After integration, staging tracks `development` and waits for CI. Its persistent URL is [elspetheastman-staging](https://elspetheastman-staging-88aaa77aa136.herokuapp.com/), also available from the `elspetheastman-cicd` pipeline. Check the build and release logs when a deployment fails; a successful build can still have a failed migration release.

## Iterate on a change

1. Branch from the current `development` revision and open a pull request with `development` as its base. Direct pushes, force pushes, and deletion are blocked, including for administrators.
2. Wait for both required GitHub Actions checks and the Heroku Review App deployment. Open the preview, exercise the changed behavior, and run the revision smoke check below with the PR's full head SHA.
3. Push any follow-up changes to the same feature branch. Each update reruns CI and rebuilds the preview. Confirm both the required checks and the preview's new SHA before integrating.
4. Merge the passing PR, then wait for the `development` push checks and staging deployment. Validate staging against the merge commit SHA before starting dependent work.

A failed check blocks integration. Heroku's initial Review App creation waits for CI, but [updates to existing previews can deploy even when CI fails](https://devcenter.heroku.com/articles/github-integration-review-apps#review-apps-and-ci). Required branch checks enforce integration into `development`, and staging separately waits for CI before deployment.

A failed Heroku build or migration release needs investigation even when GitHub CI is green. Use a corrective PR or, if staging is unusable, roll back a known staging release with `heroku rollback vNN --app elspetheastman-staging`. An application rollback does not reverse database migrations.

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
