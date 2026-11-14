import submitContactMe from './contact';

describe('public contact request', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });
  test('submits the visitor message without a CMS token', async () => {
    const message = { name: 'CI visitor', email: 'visitor@example.invalid', message: 'Hello' };
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ message: 'Success' }) });
    expect(await submitContactMe(message)).toEqual({ status: 200, data: { message: 'Success' } });
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/contact-me\/$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(message);
    expect(options.headers.Authorization).toBeUndefined();
  });
  test('preserves validation errors for the form', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 400, json: async () => ({ email: ['Invalid email'] }) });
    expect(await submitContactMe({})).toEqual({ status: 400, data: { email: ['Invalid email'] } });
  });
  test('reports a failed connection without fabricating success', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    expect(await submitContactMe({})).toBeNull();
  });
});
