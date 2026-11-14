const { test: base, expect } = require('@playwright/test');
const { execFileSync } = require('node:child_process');
const { root, python, baseURL, environment } = require('./environment.cjs');

function database(command = 'inspect') {
  const output = execFileSync(python, ['e2e/seed.py', command], { cwd: root, env: environment, encoding: 'utf8' });
  return command === 'inspect' ? JSON.parse(output) : undefined;
}

const thumbnail = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#d9ecf4"/><rect x="20" y="20" width="440" height="320" fill="#b9d9e9"/></svg>';
const embeddedMedia = '<!doctype html><html><body style="margin:0;background:#e4eff4;font:16px sans-serif;display:grid;place-items:center;height:100vh">External media fixture</body></html>';

const test = base.extend({
  baseline: [async ({ page, context }, use) => {
    database('reset');
    await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === baseURL) return route.continue();
      if (url.hostname === 'img.youtube.com') return route.fulfill({ contentType: 'image/svg+xml', body: thumbnail });
      if (['www.youtube.com', 'w.soundcloud.com'].includes(url.hostname)) {
        return route.fulfill({ contentType: 'text/html', body: embeddedMedia });
      }
      return route.abort('blockedbyclient');
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use();
    expect(errors, 'Unexpected browser exceptions').toEqual([]);
  }, { auto: true }],
});

async function login(page, ui = false) {
  if (ui) {
    await page.goto('/login');
    await page.locator('input[name="username"]').fill('e2e-editor');
    await page.locator('input[name="password"]').fill('e2e-only-password');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
  } else {
    const response = await page.request.post('/api/session/login/', { data: { username: 'e2e-editor', password: 'e2e-only-password' } });
    expect(response.status()).toBe(200);
    const { token } = await response.json();
    await page.addInitScript(token => sessionStorage.setItem('ElspethEastmanAuthToken', token), token);
    await page.goto('/cms');
  }
  await expect(page).toHaveURL(/\/cms$/);
  await expect(page.locator('textarea[name="Voice Acting"]')).toHaveValue(/Voice acting fixture/);
  await expect(projectCards(page)).toHaveCount(6);
  await expect(page.locator('input[name="affiliationText"]')).toHaveCount(2);
}

function projectSection(page) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: 'All Projects', exact: true }) });
}

function projectCards(page) {
  return projectSection(page).locator(':scope > div').last().locator(':scope > div');
}

async function actionResponse(page, method, path, action, status = 200) {
  const pending = page.waitForResponse(response => new URL(response.url()).pathname === path && response.request().method() === method);
  await action();
  const response = await pending;
  expect(response.status()).toBe(status);
  return response.json();
}

async function stablePage(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})));
  });
  await expect(page.getByText('Loading Soundcloud...')).toHaveCount(0);
  const soundcloud = page.getByTitle('My soundcloud');
  if (await soundcloud.count()) {
    await expect(soundcloud.contentFrame().getByText('External media fixture', { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('alert')).toHaveCount(0);
}

module.exports = { test, expect, database, login, projectCards, projectSection, actionResponse, stablePage };
