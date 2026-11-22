# Redesign browser regression suite

Playwright exercises the compiled React application through Gunicorn and Django. Each scenario starts with known content in a guarded disposable database. Chromium, Firefox, and WebKit cover public pages, authentication, CMS editing, media, ordering, and promotion. Mobile Chromium and WebKit cover navigation and inline contact with device emulation.

The scenarios verify:

- Fresh loads of all six pages, current-slug routing, renamed navigation, invalid addresses, and retry after a failed read.
- Cached Voiceover/Press selection, direct links, history, focus restoration, and query/hash preservation across renames and public/CMS mode switches.
- Selected-entry deletion restores collection focus after the native editor modal closes, in both Voiceover and Press.
- Required and incorrect login credentials, selected CMS return locations, reload, logout, and expired mutation credentials.
- Create/edit/reload/delete for roles, releases, recent streams, clips, coverage, appearances, chapters, and current work.
- Shared text/identity/fact/image editors, independent music practice, complete ordering, canonical hero identity, and closing deleted selection.
- Inline contact validation, actual Django persistence and console mail, pending submission, and network/server recovery.
- Typing corrections after required-field validation retains focus; unrelated Press edits preserve the full stored publication timestamp despite the date control's millisecond display.
- Failed CMS drafts, duplicate prevention, modal focus/Escape, corrupt-media rejection, verified uploads, and canonical response reconciliation.
- Retained legacy public API snapshots, anonymous write rejection, private contact listing, CSRF, invalid pagination, and guarded database resets.

The redesigned API uses grouped `/api/v2/` routes and UUIDv4 public identifiers. Fixtures and retained legacy API snapshots use public UUIDs while database integer keys remain internal. Packaged images resolve under `/static/portfolio/v1/`; uploaded images use the configured media backend.

Every built Storybook story renders independently in Chromium. A story fails if it requests application APIs or raises a browser exception. Browser workflows also reject unexpected page exceptions. CI forbids focused tests, uses zero retries, and retains failure screenshots, videos, and traces.

## Run and review

Use the pinned Linux runner for reproducible screenshots:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm storybook:build
pnpm test:e2e:docker
```

The Docker image pins Playwright and installs runtime Python dependencies from Poetry's lockfile. Select a project or scenario during iteration:

```sh
pnpm test:e2e:docker --project=chromium e2e/cms.spec.ts
pnpm test:e2e:docker --project=api
pnpm test:e2e:docker --project=visual
```

Native interaction checks use `E2E_PYTHON=/path/to/venv/bin/python pnpm test:e2e --project=chromium` after installing locked dependencies and Playwright browsers. Run one suite per checkout: the disposable database and loopback ports are shared. Storybook runs through Vite preview; it performs no backend reads.

The Linux visual matrix captures 1728px desktop and 400px mobile public pages, selected details, inline validation, every CMS page, and representative editors. Public captures assert anonymous state. Page captures use the full page; editor captures use the visible viewport. Soft assertions collect every comparison in one matrix run. Ordinary runs fail for missing or changed goldens and preserve each `redesign-*-actual.png` under `test-results/`, including when no golden exists; CI never accepts them automatically. Comparison permits at most 100 differing pixels.

For an intentional visual change, generate with `pnpm test:e2e:docker --project=visual --update-snapshots`, inspect every changed image, and commit the reviewed files. Legacy API JSON lives in `snapshots/api.spec.ts/public-api.json`; endpoint cases compare it independently of the redesigned UI. The retired Projects page remains missing while its historical API/data stays available.

Open reports with `pnpm test:e2e:report`. GitHub Actions retains `playwright-results-<event>` reports and attachments for 14 days.

## Isolation

The default database is `.e2e/db.sqlite3`. CI uses a dedicated PostgreSQL 17 database named `elspeth_e2e`. Fixture commands require the E2E secret/environment and reject other SQLite paths or PostgreSQL hosts/database names. The harness ignores ordinary `DATABASE_URL`, clears the storage bucket override, and forces uploads into `.e2e/media`.

All added content and outbound URLs are fixtures. External browser requests are blocked; no media provider or email delivery is involved. The guarded `e2e.wsgi` uses the real Django contact flow and console backend with a fixed Message-ID hostname so workstation reverse DNS cannot stall submission. Production's WSGI module is unchanged.

Dates, locale, and reduced-motion settings are fixed. Mobile runs are emulation, not physical-device evidence. macOS Figma comparisons are recorded separately in `docs/redesign-evidence/`; Linux goldens reflect the fonts available in the pinned runner.
