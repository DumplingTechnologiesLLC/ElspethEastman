# Development and deployment

Develop on a feature branch and open its pull request against `development`. GitHub runs the frontend tests and production build, then checks Django against PostgreSQL, applies migrations twice, and runs backend regression tests. Playwright exercises the compiled application against a separate PostgreSQL test database, including browser workflows and committed visual/API baselines. `Frontend`, `Backend`, and `Playwright` must pass before integration. The checks use test-only credentials and no Heroku secrets.

Heroku creates a disposable Review App for the pull request after CI succeeds. Its database is provisioned separately, the existing data migrations provide sample content, and email goes to the console backend. Review Apps expire after one day of inactivity. Treat the URL as temporary and use example data when testing.

After integration, staging tracks `development` and waits for CI. Its persistent URL is [elspetheastman-staging](https://elspetheastman-staging-88aaa77aa136.herokuapp.com/), also available from the `elspetheastman-cicd` pipeline. Check the build and release logs when a deployment fails; a successful build can still have a failed migration release.

## Iterate on a change

1. Branch from the current `development` revision and open a pull request with `development` as its base. Direct pushes, force pushes, and deletion are blocked, including for administrators.
2. Wait for all three required GitHub Actions checks and the Heroku Review App deployment. Open the preview, exercise the changed behavior, and run the revision smoke check below with the PR's full head SHA.
3. Push any follow-up changes to the same feature branch. Each update reruns CI and rebuilds the preview. Confirm both the required checks and the preview's new SHA before integrating.
4. Merge the passing PR, then wait for the `development` push checks and staging deployment. Validate staging against the merge commit SHA before starting dependent work.

A failed check blocks integration. Heroku's initial Review App creation waits for CI, but [updates to existing previews can deploy even when CI fails](https://devcenter.heroku.com/articles/github-integration-review-apps#review-apps-and-ci). Required branch checks enforce integration into `development`, and staging separately waits for CI before deployment.

A failed Heroku build or migration release needs investigation even when GitHub CI is green. Use a corrective PR or, if staging is unusable, roll back a known staging release with `heroku rollback vNN --app elspetheastman-staging`. An application rollback does not reverse database migrations.

## Build and migration behavior

The Node buildpack runs before Python. The Node buildpack installs the root pnpm lockfile and runs `heroku-postbuild`. Vite compiles React and writes the full Git commit to `/static/revision.json`, alongside a Django-compatible asset manifest. The Python buildpack installs `poetry.lock` with Poetry and collects the generated static files. Build output is ignored by Git; frontend edits need no manual bundle commit.

The `release` process runs `python manage.py migrate --noinput` on each release, including subsequent Review App updates. Keep migrations compatible with the previous application version. Data initialization must preserve content already edited through the CMS.

Staging and Review Apps set `DEPLOYMENT_ENV` and `EMAIL_BACKEND`. Configuration rejects a live email backend in those environments, including when `DEBUG=False`. Staging has its own database and no Mailgun key. Future uploaded media must also use separate non-production storage.

## Validate a deployed revision

Run the [Playwright regression suite](e2e/README.md) before submitting a behavior change. Review intentional screenshot and API snapshot updates in the same PR. CI publishes its HTML report, failure screenshots, videos, and traces as artifacts for 14 days.

Run `python scripts/smoke-deployment.py <preview-or-staging-url> <full-git-sha>` to verify the served revision, public/CMS routes, JavaScript bundles, and seeded APIs. Add `--contact` to submit a sample message to the console backend. The script rejects production's URL.

For local checks, use Node 22.22.3, pnpm 12.18.0, Python 3.11, and Poetry 2.5.1:

```sh
pnpm install --frozen-lockfile
poetry sync
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:coverage
pnpm build
pnpm storybook:build
poetry run python manage.py collectstatic --noinput
poetry run python manage.py makemigrations --check --dry-run
poetry run coverage run manage.py test --noinput
poetry run coverage report
pnpm test:e2e:docker
```

Supply `SECRET_KEY`, `CONTACT_EMAIL`, `DEFAULT_FROM_EMAIL`, and `DEFAULT_TO_EMAIL` in the environment. Use `DEBUG=False`, `HEROKU=False`, `DEPLOYMENT_ENV=ci`, and `EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend` for deployment-equivalent tests. `DATABASE_URL` selects PostgreSQL; without it, local development uses SQLite. `pyproject.toml` declares runtime and development dependencies, and `poetry.lock` freezes their resolved versions. Keep lockfile updates in the same PR as dependency changes.

The `Frontend` check enforces strict TypeScript, Oxlint, the architecture checker, Prettier, and 100% unit coverage, then builds the client and Storybook. `Backend` enforces 100% Django statement and branch coverage against PostgreSQL. `Playwright` checks the compiled application and every isolated Storybook story using the pinned Linux browser image. The existing required job names remain stable.

## Production release boundary

`master` remains at its existing revision and is locked against updates, including administrator pushes. This development setup makes no production deployment or configuration changes. The existing production GitHub auto-deploy binding remains configured for `master`.

A production release requires a separate, explicit operation: review the staging-tested commit, prepare a database backup and application rollback target, arrange the manual production deployment/promotion policy, and deliberately unlock the release branch. Never merge into `master` or push to the `heroku` Git remote as part of ordinary development. Application rollback does not restore database or uploaded-media state.
