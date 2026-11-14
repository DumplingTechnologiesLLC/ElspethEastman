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
  await service.request('/api/contact-me/', 'POST', { name: 'Visitor' });
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/contact-me/',
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
  await missingCookie.request('/api/session/', 'POST', undefined, true);
  expect(fetcher).toHaveBeenLastCalledWith(
    '/api/session/',
    expect.objectContaining({
      headers: {
        'X-CSRFToken': 'null',
        'Content-Type': 'application/json',
        Authorization: 'Token abc',
      },
    }),
  );
});
