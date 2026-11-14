const { test, expect, database } = require('./fixtures.cjs');
const { spawnSync } = require('node:child_process');
const { mkdirSync, writeFileSync, readFileSync, unlinkSync } = require('node:fs');
const { root, python, environment } = require('./environment.cjs');

test('deliberate Playwright gate canary that must never merge', async () => {
  expect('intentional regression').toBe('blocked by required Playwright check');
});

test('public response shapes and fixture content match the current contract', async ({ request }) => {
  const responses = {};
  for (const path of ['/api/skills/', '/api/footerstats/', '/api/experience/', '/api/affiliations/', '/api/projects/list/', '/api/projects/paginated/?page=1']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    responses[path] = await response.json();
  }
  expect(JSON.stringify(responses, null, 2) + '\n').toMatchSnapshot('public-api.json');
});

for (const [method, path] of [
  ['PATCH', '/api/skills/'],
  ['POST', '/api/projects/list/'], ['PATCH', '/api/projects/list/6/'], ['DELETE', '/api/projects/list/6/'],
  ['PATCH', '/api/projects/list/batch_update/'],
  ['POST', '/api/experience/'], ['PATCH', '/api/experience/1/'], ['DELETE', '/api/experience/1/'],
  ['POST', '/api/affiliations/'], ['PATCH', '/api/affiliations/1/'], ['DELETE', '/api/affiliations/1/'],
]) {
  test(`anonymous ${method} ${path} cannot modify content`, async ({ request }) => {
    const before = database();
    const response = await request.fetch(path, { method, data: {} });
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ detail: 'Forbidden' });
    expect(database()).toEqual(before);
  });
}

test('contact listing is private and session POSTs enforce CSRF', async ({ request }) => {
  expect((await request.get('/api/contact-me/')).status()).toBe(403);
  expect((await request.post('/api/session/')).status()).toBe(403);
  const response = await request.get('/api/session/');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ isAuthenticated: false });
  const csrf = (await request.storageState()).cookies.find(cookie => cookie.name === 'csrftoken').value;
  const validPost = await request.post('/api/session/', { headers: { 'X-CSRFToken': csrf } });
  expect(validPost.status()).toBe(200);
  expect(await validPost.json()).toEqual({ isAuthenticated: false });
});

test('pagination rejects missing and nonnumeric page parameters', async ({ request }) => {
  const missing = await request.get('/api/projects/paginated/');
  expect(missing.status()).toBe(400);
  expect(await missing.text()).toBe('Page is required');
  const invalid = await request.get('/api/projects/paginated/?page=invalid');
  expect(invalid.status()).toBe(400);
  expect(await invalid.text()).toBe('Page must be an integer');
});

test('fixture reset refuses other database targets without changing them', async () => {
  const sentinel = `${root}/.e2e/do-not-reset.sqlite3`;
  const before = database();
  mkdirSync(`${root}/.e2e`, { recursive: true });
  writeFileSync(sentinel, 'Preserve this unrelated database target', { flag: 'wx' });
  try {
    for (const url of [`sqlite:///${sentinel}`, 'postgres://test:test@not-local.invalid/elspeth_e2e']) {
      const result = spawnSync(python, ['e2e/seed.py', 'reset'], {
        cwd: root, encoding: 'utf8', timeout: 5000,
        env: { ...environment, DATABASE_URL: url },
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Refusing to reset a non-E2E');
    }
    expect(readFileSync(sentinel, 'utf8')).toBe('Preserve this unrelated database target');
    expect(database()).toEqual(before);
  } finally {
    unlinkSync(sentinel);
  }
});
