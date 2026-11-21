import { it, expect, database } from './fixtures.ts';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { root, python, environment } from './environment.ts';

const publicAPI = JSON.parse(
  readFileSync('e2e/snapshots/api.spec.ts/public-api.json', 'utf8'),
) as Record<string, unknown>;
it.each(Object.entries(publicAPI))(([path, expected]) =>
  it(`preserves the public response contract for ${path}`, async ({
    request,
  }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(expected);
  }),
);

it.each([
  ['PATCH', '/api/skills/'],
  ['POST', '/api/projects/list/'],
  ['PATCH', '/api/projects/list/6/'],
  ['DELETE', '/api/projects/list/6/'],
  ['PATCH', '/api/projects/list/batch_update/'],
  ['POST', '/api/experience/'],
  ['PATCH', '/api/experience/1/'],
  ['DELETE', '/api/experience/1/'],
  ['POST', '/api/affiliations/'],
  ['PATCH', '/api/affiliations/1/'],
  ['DELETE', '/api/affiliations/1/'],
] as const)(([method, path]) =>
  it(`rejects anonymous ${method} ${path} without modifying content`, async ({
    request,
  }) => {
    const before = database();
    const response = await request.fetch(path, { method, data: {} });
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ detail: 'Forbidden' });
    expect(database()).toEqual(before);
  }),
);

it('keeps contact listing private and enforces CSRF for session POSTs', async ({
  request,
}) => {
  expect((await request.get('/api/contact-me/')).status()).toBe(403);
  expect((await request.post('/api/session/')).status()).toBe(403);
  const response = await request.get('/api/session/');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ isAuthenticated: false });
  const csrf = (await request.storageState()).cookies.find(
    (cookie) => cookie.name === 'csrftoken',
  )!.value;
  const validPost = await request.post('/api/session/', {
    headers: { 'X-CSRFToken': csrf },
  });
  expect(validPost.status()).toBe(200);
  expect(await validPost.json()).toEqual({ isAuthenticated: false });
});

it.each([
  ['/api/projects/paginated/', 'Page is required'],
  ['/api/projects/paginated/?page=invalid', 'Page must be an integer'],
] as const)(([path, message]) =>
  it(`rejects an invalid pagination request: ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(400);
    expect(await response.text()).toBe(message);
  }),
);

it.each(['sqlite', 'postgres'] as const)((target) =>
  it(`refuses to reset a non-E2E ${target} database without changing content`, async () => {
    const sentinel = `${root}/.e2e/do-not-reset.sqlite3`;
    const before = database();
    mkdirSync(`${root}/.e2e`, { recursive: true });
    writeFileSync(sentinel, 'Preserve this unrelated database target', {
      flag: 'wx',
    });
    try {
      const url =
        target === 'sqlite'
          ? `sqlite:///${sentinel}`
          : 'postgres://test:test@not-local.invalid/elspeth_e2e';
      const result = spawnSync(python, ['e2e/seed.py', 'reset'], {
        cwd: root,
        encoding: 'utf8',
        timeout: 5000,
        env: { ...environment, DATABASE_URL: url },
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Refusing to reset a non-E2E');
      expect(readFileSync(sentinel, 'utf8')).toBe(
        'Preserve this unrelated database target',
      );
      expect(database()).toEqual(before);
    } finally {
      unlinkSync(sentinel);
    }
  }),
);
it('rejects every anonymous redesign mutation and preserves all six aggregates', async ({
  request,
}) => {
  const registry = (await (await request.get('/api/site/')).json()) as {
    pages: { id: number }[];
  };
  const urls = registry.pages.map((page) => '/api/pages/' + page.id + '/');
  const read = async () =>
    Promise.all(
      urls.map(async (url) => {
        const response = await request.get(url);
        expect(response.status()).toBe(200);
        return response.json() as Promise<unknown>;
      }),
    );
  const before = await read();
  const operations = [
    ...[
      'copy',
      'eyebrows',
      'trivia',
      'content-entries',
      'music-releases',
      'stream-clips',
      'appearances',
      'bio-chapters',
      'current-items',
      'media-assets',
    ].map((name) => ({ method: 'POST', url: '/api/' + name + '/' })),
    ...[
      'copy',
      'page-images',
      'featured-items',
      'music-features',
      'collections/reorder',
    ].map((name) => ({ method: 'PATCH', url: '/api/' + name + '/' })),
    { method: 'PATCH', url: urls[0]! },
  ];
  const responses = await Promise.all(
    operations.map((operation) =>
      request.fetch(operation.url, { method: operation.method, data: {} }),
    ),
  );
  for (const response of responses) expect(response.status()).toBe(403);
  expect(await read()).toEqual(before);
});
