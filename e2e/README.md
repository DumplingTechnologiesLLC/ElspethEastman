# Browser regression baseline

Playwright exercises the compiled React application through Gunicorn and Django. Every test starts with known content in a disposable database, and successful CMS edits are checked against persisted records and public responses. The suite preserves the site's current behavior so redesign changes can be reviewed against an explicit baseline.

Desktop Chromium, Firefox, and WebKit run the browser workflows. Mobile Chromium and WebKit run the public navigation and contact workflows with iPhone emulation. Linux Chromium compares desktop and mobile screenshots, and a shared JSON snapshot records the public API response shapes and fixture content.

The browser scenarios cover:

- Public sections, all skill descriptions, project pagination, direct links, reloads, video activation, empty lists, and failed loads.
- Anonymous contact validation, submission, persistence, draft clearing, cancellation, pending requests, and recovery from network/server errors.
- Login validation, incorrect credentials, session restoration, logout/token revocation, and invalid saved tokens.
- CMS skills, project preview/reset and individual/batch saves, project CRUD, all four experience categories, TBA formatting, affiliations, validation, and delete cancellation.
- Anonymous write rejection, private contact listing, CSRF enforcement, invalid pagination parameters, and expired write tokens.

Every built Storybook story also renders in Chromium with supplied props and callback spies. These checks reject browser exceptions and application API requests.

Unexpected browser exceptions fail tests. CI rejects focused tests, stops on the first failure, and uses zero retries so failures remain visible.

## Run the suite

Install Node 22, pnpm 12.18.0, and Docker, then run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm storybook:build
pnpm test:e2e:docker
```

The Docker runner uses a pinned Playwright image and the same x86 Linux environment as CI. Its Python dependencies come from the runtime lockfile. Docker's first build downloads the browsers and installs the Python environment; subsequent runs reuse those layers.

Select a workflow while iterating:

```sh
pnpm test:e2e:docker --project=chromium e2e/cms.spec.ts
pnpm test:e2e:docker --project=api
pnpm test:e2e:docker --project=visual
```

Native runs are also available with `E2E_PYTHON=/path/to/venv/bin/python pnpm test:e2e --project=chromium` after running `poetry sync` and running `pnpm exec playwright install chromium`. Visual comparisons run in Linux; use Docker to review or update their baselines. Run one suite at a time per checkout because the database reset and loopback server are shared.

## Review an intentional baseline change

Run the relevant update command, inspect the changed screenshots or JSON, and commit the approved baseline changes with the behavior change:

```sh
pnpm test:e2e:docker --project=visual --update-snapshots
git diff -- e2e/snapshots
```

For an intentional API contract change, edit the corresponding endpoint entry in `e2e/snapshots/api.spec.ts/public-api.json`, review the JSON diff, and run `pnpm test:e2e:docker --project=api`. Each endpoint has its own `it.each` case against that shared baseline. Playwright tables register through native `it` callbacks so fixture discovery, source locations, and snapshot paths remain intact.

Ordinary runs compare committed baselines and fail if a baseline is missing. CI never regenerates them. Screenshot comparison permits at most 100 differing pixels to accommodate minor rendering noise.

The HTML report includes test steps and attachments. Failed browser tests retain screenshots, video, and traces. Open a local report with `pnpm test:e2e:report`. In GitHub Actions, download the `playwright-results-<event>` artifact; reports and attachments are retained for 14 days.

## Database and external-service boundaries

The default database is the ignored `.e2e/db.sqlite3`. CI supplies `E2E_DATABASE_URL` for a dedicated PostgreSQL 17 database named `elspeth_e2e`. Fixture commands check the dedicated E2E secret and environment, then reject database targets outside that exact SQLite path or the allowed local PostgreSQL hosts/database name. The harness ignores the application's ordinary `DATABASE_URL` and always targets its own loopback web server.

Fixtures reset before every test. The test editor password, contact addresses, and content are synthetic. Email uses Django's console backend. Tests capture persistence and application behavior without delivering email.

YouTube thumbnails and YouTube/SoundCloud embeds use deterministic local responses. The tests verify the application's embed URLs and activation behavior; provider availability and playback remain outside the suite. Browser time and locale are fixed for stable dates and screenshots. Mobile projects use emulation rather than physical devices.

## Current UI quirks

The baseline records existing behavior, including the current narrow layouts. Existing form labels lack matching input IDs; tests use stable input names where label selectors cannot work. Invalid affiliation creation currently closes its modal after server validation, and a characterization test records that behavior while checking that no record was created.

An aborted session-validation request currently clears browser credentials and returns to login even though the server token remains valid. An aborted logout also clears browser credentials while retaining the server token. Separate failure scenarios record both behaviors, and login transport failures are checked for notification and retry. Normal navigation scenarios wait for completed session validation before starting another navigation so they exercise the settled login flow.

Review these characterizations when deliberately changing those flows. Keep unrelated behavior changes out of baseline maintenance.
