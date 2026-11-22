import { withCases } from '../tooling/withCases.ts';
import type { Page } from '@playwright/test';
import type { ProjectDTO } from '../frontend/src/application/dto/ProjectDTO';
import type { Skills } from '../frontend/src/domain/models/Skills';
import type { Affiliation } from '../frontend/src/domain/models/Affiliation';
import type { ContactDraft } from '../frontend/src/domain/models/ContactDraft';
import { test as base, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { root, python, baseURL, environment } from './environment.ts';
interface DatabaseSnapshot {
  projects: ProjectDTO[];
  skills: Skills[];
  affiliations: Affiliation[];
  contacts: (ContactDraft & { sent: boolean })[];
  experience: { id: string; credit: string }[];
}

function database(
  command: 'inspect' | 'reset' | 'empty-projects' | 'expire-tokens' = 'inspect',
): DatabaseSnapshot {
  const output = execFileSync(python, ['e2e/seed.py', command], {
    cwd: root,
    env: environment,
    encoding: 'utf8',
  });
  return JSON.parse(command === 'inspect' ? output : '{}') as DatabaseSnapshot;
}

const thumbnail =
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#d9ecf4"/><rect x="20" y="20" width="440" height="320" fill="#b9d9e9"/></svg>';
const embeddedMedia =
  '<!doctype html><html><body style="margin:0;background:#e4eff4;font:16px sans-serif;display:grid;place-items:center;height:100vh">External media fixture</body></html>';

const it = withCases(
  base.extend<{ baseline: void }>({
    baseline: [
      async ({ page, context }, use) => {
        database('reset');
        await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
        await context.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin === baseURL) return route.continue();
          if (url.hostname === 'img.youtube.com')
            return route.fulfill({
              contentType: 'image/svg+xml',
              body: thumbnail,
            });
          if (['www.youtube.com', 'w.soundcloud.com'].includes(url.hostname)) {
            return route.fulfill({
              contentType: 'text/html',
              body: embeddedMedia,
            });
          }
          return route.abort('blockedbyclient');
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await use();
        expect(errors, 'Unexpected browser exceptions').toEqual([]);
      },
      { auto: true },
    ],
  }),
);

async function login(page: Page, ui = false) {
  if (ui) {
    await page.goto('/login');
    await page.locator('input[name="username"]').fill('e2e-editor');
    await page.locator('input[name="password"]').fill('e2e-only-password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
  } else {
    const response = await page.request.post('/api/session/login/', {
      data: { username: 'e2e-editor', password: 'e2e-only-password' },
    });
    expect(response.status()).toBe(200);
    const { token } = await response.json();
    await page.addInitScript(
      (savedToken) =>
        sessionStorage.setItem('ElspethEastmanAuthToken', savedToken),
      token,
    );
    await page.goto('/cms');
  }
  await expect(page).toHaveURL(/\/cms$/);
  await expect(page.locator('textarea[name="Voice Acting"]')).toHaveValue(
    /Voice acting fixture/,
  );
  await expect(projectCards(page)).toHaveCount(6);
  await expect(page.locator('input[name="affiliationText"]')).toHaveCount(2);
}

function projectSection(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: 'All Projects', exact: true }),
  });
}

function projectCards(page: Page) {
  return projectSection(page)
    .locator(':scope > div')
    .last()
    .locator(':scope > div');
}

async function actionResponse<T = unknown>(
  page: Page,
  method: string,
  path: string,
  action: () => Promise<unknown>,
  status = 200,
): Promise<T> {
  const pending = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === path &&
      response.request().method() === method,
  );
  await action();
  const response = await pending;
  expect(response.status()).toBe(status);
  return response.json();
}

async function stablePage(page: Page) {
  const pathname = new URL(page.url()).pathname;
  if (['/', '/projects', '/cms'].includes(pathname)) {
    await Promise.all(
      ['Fixture games', 'Fixture voices', 'Fixture broadcasts'].map((label) =>
        expect(page.getByText(label, { exact: true })).toBeVisible(),
      ),
    );
    if (pathname === '/cms') {
      await expect(
        page.locator('input[name="affiliationText"][value="Fixture Studio"]'),
      ).toHaveCount(1);
    } else {
      await expect(
        page.getByRole('link', { name: 'Fixture Studio', exact: true }),
      ).toBeVisible();
    }
  }
  if (['/', '/cms'].includes(pathname)) {
    await Promise.all(
      [
        '(2021) Fixture Voice Credits',
        '(2022) Fixture Music - Games',
        '(2023) Fixture Music - Miscellaneous',
        '(TBA) Fixture Streaming - Credits',
      ].map((credit) =>
        expect(
          page.getByRole('link', { name: credit, exact: true }),
        ).toBeVisible(),
      ),
    );
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) => image.decode().catch(() => {})),
    );
  });
  await expect(page.getByText('Loading Soundcloud...')).toHaveCount(0);
  const soundcloud = page.getByTitle('My soundcloud');
  if (await soundcloud.count()) {
    await expect(
      soundcloud
        .contentFrame()
        .getByText('External media fixture', { exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByRole('alert')).toHaveCount(0);
}

export {
  it,
  expect,
  database,
  login,
  projectCards,
  projectSection,
  actionResponse,
  stablePage,
};
