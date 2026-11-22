import { it, expect, vi } from 'vitest';
import { BrowserHttp, cookie } from '../BrowserHttp';
import { fixturePorts } from '../../../../test/fakes';
it('extracts and decodes an exact cookie key', () => {
  expect(cookie('other=bad; csrftoken=hello%20world', 'csrftoken')).toBe(
    'hello world',
  );
  expect(cookie('prefixcsrftoken=bad', 'csrftoken')).toBeNull();
});
it('uses public GET requests and normalizes failed responses', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }))
    .mockResolvedValueOnce(new Response('failure', { status: 500 }))
    .mockRejectedValueOnce(new TypeError('Network'))
    .mockResolvedValueOnce(new Response('not json', { status: 200 }));
  const service = new BrowserHttp(fetcher, () => '', fixturePorts().tokens);
  expect(await service.request('/api')).toEqual({
    status: 200,
    data: { ok: true },
  });
  expect(fetcher).toHaveBeenCalledWith('/api', undefined);
  for (let i = 0; i < 3; i++)
    // oxlint-disable-next-line no-await-in-loop -- Consume the queued responses in order.
    expect(await service.request('/api')).toEqual({ status: null, data: null });
});
it('sends csrf, credentials and token only when requested', async () => {
  const ports = fixturePorts();
  ports.tokens.write('abc');
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response('{}', { status: 200 }));
  const service = new BrowserHttp(
    fetcher,
    () => 'csrftoken=csrf',
    ports.tokens,
  );
  await service.request('/api/v2/contact/', 'POST', { name: 'Visitor' });
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/v2/contact/',
    expect.objectContaining({
      method: 'POST',
      body: '{"name":"Visitor"}',
      headers: { 'X-CSRFToken': 'csrf', 'Content-Type': 'application/json' },
    }),
  );
  await service.request(
    '/api/skills/',
    'PATCH',
    { voice_acting: 'Voice' },
    true,
  );
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/skills/',
    expect.objectContaining({
      credentials: 'same-origin',
      headers: {
        'X-CSRFToken': 'csrf',
        'Content-Type': 'application/json',
        Authorization: 'Token abc',
      },
    }),
  );
  const missingCookie = new BrowserHttp(fetcher, () => '', ports.tokens);
  await missingCookie.request('/api/v2/session/', 'POST', undefined, true);
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/v2/session/',
    expect.objectContaining({
      headers: {
        'X-CSRFToken': 'null',
        'Content-Type': 'application/json',
        Authorization: 'Token abc',
      },
    }),
  );
});
it('bootstraps a fresh Vite CSRF cookie once for concurrent writes and reuses it', async () => {
  let cookies = '';
  let release!: () => void;
  const bootstrap = new Promise<Response>((resolve) => {
    release = () => {
      cookies = 'csrftoken=dev-csrf';
      resolve(new Response('{}'));
    };
  });
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async (path) =>
      path === '/api/v2/session/' ? bootstrap : new Response('{}'),
    );
  const service = new BrowserHttp(
    fetcher,
    () => cookies,
    fixturePorts().tokens,
  );
  const first = service.request('/api/one/', 'POST', {});
  const second = service.request('/api/two/', 'PATCH', {});
  expect(fetcher).toHaveBeenCalledOnce();
  release();
  await Promise.all([first, second]);
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/two/',
    expect.objectContaining({
      headers: {
        'X-CSRFToken': 'dev-csrf',
        'Content-Type': 'application/json',
      },
    }),
  );
  await service.request('/api/three/', 'POST');
  expect(fetcher).toHaveBeenCalledTimes(4);
});
it('allows a failed CSRF bootstrap to retry on the next write', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockRejectedValueOnce(new TypeError('Offline'))
    .mockResolvedValue(new Response('{}'));
  const service = new BrowserHttp(fetcher, () => '', fixturePorts().tokens);
  expect((await service.request('/api/one/', 'POST')).status).toBeNull();
  expect((await service.request('/api/one/', 'POST')).status).toBe(200);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
it('uses status-only logout responses without requiring JSON bodies', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('upstream error', { status: 500 }));
  const service = new BrowserHttp(
    fetcher,
    () => 'csrftoken=csrf',
    fixturePorts().tokens,
  );
  expect(
    await service.request(
      '/api/v2/session/logout/',
      'POST',
      undefined,
      true,
      'status',
    ),
  ).toEqual({ status: 500, data: null });
});

it('preserves content API statuses including created, empty success and malformed error bodies', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('{"id":42}', { status: 201 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(
      new Response('{"detail":"Missing"}', { status: 404 }),
    )
    .mockResolvedValueOnce(new Response('upstream failed', { status: 502 }))
    .mockRejectedValueOnce(new TypeError('Offline'));
  const http = new BrowserHttp(
    fetcher,
    () => 'csrftoken=csrf',
    fixturePorts().tokens,
  );
  expect(await http.request('/api/copy/', 'POST', {}, true, 'content')).toEqual(
    { status: 201, data: { id: 42 } },
  );
  expect(
    await http.request('/api/copy/', 'DELETE', undefined, true, 'content'),
  ).toEqual({ status: 204, data: null });
  expect(
    await http.request('/api/pages/42/', 'GET', undefined, false, 'content'),
  ).toEqual({ status: 404, data: { detail: 'Missing' } });
  expect(
    await http.request('/api/pages/42/', 'GET', undefined, false, 'content'),
  ).toEqual({ status: 502, data: null });
  expect(
    await http.request('/api/pages/42/', 'GET', undefined, false, 'content'),
  ).toEqual({ status: null, data: null });
});

it('lets the browser set the multipart boundary while retaining auth and CSRF headers', async () => {
  const ports = fixturePorts();
  ports.tokens.write('editor');
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response('{"id":42}', { status: 201 }));
  const http = new BrowserHttp(fetcher, () => 'csrftoken=csrf', ports.tokens);
  const body = new FormData();
  body.append(
    'file',
    new File(['image'], 'portrait.png', { type: 'image/png' }),
  );
  await http.request('/api/media-assets/', 'POST', body, true, 'content');
  expect(fetcher).toHaveBeenCalledWith('/api/media-assets/', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    body,
    headers: { 'X-CSRFToken': 'csrf', Authorization: 'Token editor' },
  });
});

it('binds a write to its original credential before CSRF bootstrap completes', async () => {
  const { tokens } = fixturePorts();
  tokens.write('old-token');
  let release!: () => void;
  const bootstrap = new Promise<Response>((resolve) => {
    release = () => resolve(new Response('{}'));
  });
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async (path) =>
      path === '/api/v2/session/' ? bootstrap : new Response('{}'),
    );
  const http = new BrowserHttp(fetcher, () => '', tokens);
  const pending = http.request(
    '/api/v2/pages/copy/',
    'PATCH',
    {},
    true,
    'content',
  );
  tokens.write('new-token');
  release();
  await pending;
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/v2/pages/copy/',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Token old-token' }),
    }),
  );
});

it('preserves status-mode GET success and legacy transport failure behavior', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('{}'))
    .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }));
  const http = new BrowserHttp(fetcher, () => '', fixturePorts().tokens);
  expect(
    await http.request('/status', 'GET', undefined, false, 'status'),
  ).toEqual({ status: 200, data: null });
  expect(
    await http.request('/status', 'GET', undefined, false, 'status'),
  ).toEqual({ status: null, data: null });
});
