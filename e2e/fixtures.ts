import { withCases } from '../tooling/withCases.ts';
import type { PageContentDTO } from '../frontend/src/application/dto/PageContentDTO';
import type { PageDTO } from '../frontend/src/application/dto/PageDTO';
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
  experience: { id: number; credit: string }[];
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

const it = withCases(
  base.extend<{ baseline: void }>({
    baseline: [
      async ({ page, context }, use) => {
        database('reset');
        await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
        await context.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin === baseURL) return route.continue();
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

async function login(page: Page, ui = false, path = '/cms') {
  if (ui) {
    await page.goto('/login?returnTo=' + encodeURIComponent(path));
    await page.getByLabel(/^Username/).fill('e2e-editor');
    await page.getByLabel(/^Password/).fill('e2e-only-password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
  } else {
    const response = await page.request.post('/api/session/login/', {
      data: { username: 'e2e-editor', password: 'e2e-only-password' },
    });
    expect(response.status()).toBe(200);
    const { token } = (await response.json()) as { token: string };
    await page.goto('/login');
    await page.evaluate(
      (saved) => sessionStorage.setItem('ElspethEastmanAuthToken', saved),
      token,
    );
    await page.goto(path);
  }
  await expect(page).toHaveURL(new RegExp(path.replace(/[?]/g, '\\?') + '$'));
  await expect(page.getByText('Content editor', { exact: true })).toBeVisible();
  await stablePage(page);
}
async function aggregate(page: Page, kind: string): Promise<PageContentDTO> {
  const site = await page.request.get('/api/site/');
  expect(site.status()).toBe(200);
  const registry = (await site.json()) as { pages: PageDTO[] };
  const descriptor = registry.pages.find((row) => row.kind === kind)!;
  const response = await page.request.get('/api/pages/' + descriptor.id + '/');
  expect(response.status()).toBe(200);
  return response.json() as Promise<PageContentDTO>;
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
  return (status === 204 ? null : await response.json()) as T;
}

async function stablePage(page: Page) {
  const heading = page.getByRole('main').getByRole('heading').first();
  await expect(heading).toBeVisible();
  await expect(heading).not.toHaveText(/^(Loading|Checking your session)/);

  await expect(
    page.getByRole('heading', { name: 'Loading…', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Loading page…', exact: true }),
  ).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) => {
        image.loading = 'eager';
        return image.decode();
      }),
    );
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
export { it, expect, database, login, aggregate, actionResponse, stablePage };
