import { expect, it, vi } from 'vitest';
import { fakeNotifications, fixturePorts } from '../../../../../test/fakes';
import { SessionService } from '../SessionService';

const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

it.each([false, true])(
  'preserves deep CMS return paths during validation (token %s)',
  async (authenticated) => {
    const ports = fixturePorts();
    ports.navigation.go('/cms/press?entry=12#coverage');
    if (authenticated) ports.tokens.write('expired');
    vi.mocked(ports.http.request).mockResolvedValue({
      status: 200,
      data: { isAuthenticated: false },
    });
    const session = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    const stop = session.start();
    await tick();
    expect(ports.navigation.replace).toHaveBeenCalledWith(
      '/login?returnTo=%2Fcms%2Fpress%3Fentry%3D12%23coverage',
    );
    expect(ports.tokens.read()).toBeNull();
    stop();
  },
);

it('clears credentials on explicit expiry and retains the CMS return location once', async () => {
  const ports = fixturePorts();
  ports.tokens.write('editor');
  ports.navigation.go('/cms/press?entry=12#coverage');
  vi.mocked(ports.http.request).mockResolvedValueOnce({
    status: 200,
    data: { isAuthenticated: true },
  });
  const alerts = fakeNotifications();
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    alerts,
    ports.clock,
  );
  const stop = session.start();
  await tick();
  session.expire(session.getSnapshot().path);
  await tick();
  expect(ports.tokens.read()).toBeNull();
  expect(session.getSnapshot().authenticated).toBe(false);
  expect(ports.navigation.replace).toHaveBeenCalledWith(
    '/login?returnTo=%2Fcms%2Fpress%3Fentry%3D12%23coverage',
  );
  expect(alerts.show).toHaveBeenCalledOnce();
  session.expire('/cms/press');
  expect(alerts.show).toHaveBeenCalledOnce();
  stop();
});

it('records a safe return location even when no browser token exists', () => {
  const ports = fixturePorts();
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  session.expire('https://evil.invalid/cms');
  expect(ports.navigation.replace).toHaveBeenCalledWith(
    '/login?returnTo=%2Fcms',
  );
});

it('returns to the selected CMS item after successful login', async () => {
  const ports = fixturePorts();
  ports.navigation.go('/login?returnTo=%2Fcms%2Fvoiceover%3Frole%3D4');
  vi.mocked(ports.http.request).mockResolvedValueOnce({
    status: 200,
    data: { token: 'editor' },
  });
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  session.change('username', 'Editor');
  session.change('password', 'Password');
  await session.login();
  ports.pending[0]!.callback();
  expect(ports.navigation.go).toHaveBeenLastCalledWith('/cms/voiceover?role=4');
});

it.each([200, 400])(
  'handles a missing login response body with status %s',
  async (status) => {
    const ports = fixturePorts();
    vi.mocked(ports.http.request).mockResolvedValue({ status, data: null });
    const session = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    session.change('username', 'Editor');
    session.change('password', 'Password');
    await session.login();
    expect(session.getSnapshot().authenticated).toBe(false);
    expect(session.getSnapshot().submitting).toBe(false);
    expect(ports.tokens.read()).toBeNull();
  },
);

it('ignores stale validation responses after expiry and after unsubscribing', async () => {
  const ports = fixturePorts();
  ports.tokens.write('editor');
  let release!: () => void;
  vi.mocked(ports.http.request).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () =>
          resolve({ status: 200, data: { isAuthenticated: true } });
      }),
  );
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  const stop = session.start();
  session.expire('/cms/voiceover');
  stop();
  release();
  await tick();
  expect(session.getSnapshot().authenticated).toBe(false);
  expect(ports.tokens.read()).toBeNull();
});

it('treats a missing session body as unauthenticated', async () => {
  const ports = fixturePorts();
  vi.mocked(ports.http.request).mockResolvedValue({ status: 200, data: null });
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  const stop = session.start();
  await tick();
  expect(session.getSnapshot().authenticated).toBe(false);
  stop();
});

it('ignores query-only changes during validation and prevents duplicate login requests', async () => {
  const ports = fixturePorts();
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  const stop = session.start();
  await tick();
  session.navigate('/?role=4');
  expect(ports.http.request).toHaveBeenCalledOnce();
  let release!: () => void;
  vi.mocked(ports.http.request).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ status: 400, data: null });
      }),
  );
  session.change('username', 'Editor');
  session.change('password', 'Password');
  const pending = session.login();
  await session.login();
  expect(ports.http.request).toHaveBeenCalledTimes(2);
  release();
  await pending;
  expect(session.getSnapshot().submitting).toBe(false);
  stop();
});

it('ignores expiry and validation belonging to a replaced credential', async () => {
  const ports = fixturePorts();
  ports.tokens.write('old-token');
  let release!: () => void;
  vi.mocked(ports.http.request).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ status: 403, data: null });
      }),
  );
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  const oldRevision = session.revision();
  const stop = session.start();
  ports.tokens.write('new-token');
  session.expire('/cms/press', oldRevision);
  release();
  await tick();
  expect(ports.tokens.read()).toBe('new-token');
  expect(session.getSnapshot().authenticated).toBe(true);
  expect(ports.navigation.replace).not.toHaveBeenCalled();
  session.expire('/cms/press', session.revision());
  expect(ports.tokens.read()).toBeNull();
  stop();
});

it('does not clear a newer credential when an older logout completes', async () => {
  const ports = fixturePorts();
  ports.tokens.write('old-token');
  let release!: () => void;
  vi.mocked(ports.http.request).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ status: 200, data: null });
      }),
  );
  const session = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    fakeNotifications(),
    ports.clock,
  );
  const pending = session.logout();
  ports.tokens.write('new-token');
  release();
  await pending;
  expect(ports.tokens.read()).toBe('new-token');
  expect(session.getSnapshot().authenticated).toBe(true);
  expect(ports.navigation.go).not.toHaveBeenCalled();
});
