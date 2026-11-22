import { describe, it, expect, vi } from 'vitest';
import { UIAlertService } from '../UIAlertService';
import { ApiService } from '../ApiService';
import { ContactService } from '../ContactService';
import { SessionService } from '../SessionService';
import {
  fixturePorts,
  fakeApi,
  fakeNotifications,
} from '../../../../../test/fakes';
function reply(data: unknown, status: number | null = 200) {
  return { status, data };
}
const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));
describe('notifications and API contracts', () => {
  it('publishes immutable snapshots, cancels timers, unsubscribes and disposes', () => {
    const ports = fixturePorts();
    const service = new UIAlertService(ports.clock);
    const listener = vi.fn();
    const stop = service.subscribe(listener);
    service.show({ title: 'A', content: 'B', flavor: 'info' });
    const before = service.getSnapshot();
    service.show({ title: 'C', content: 'D', flavor: 'error' });
    expect(before).toHaveLength(1);
    expect(service.getSnapshot()).toHaveLength(2);
    expect(listener).toHaveBeenCalledTimes(2);
    ports.pending[0]!.callback();
    expect(service.getSnapshot().map((toast) => toast.title)).toEqual(['C']);
    expect(ports.pending[0]!.cancel).toHaveBeenCalledOnce();
    service.dismiss(500);
    stop();
    service.dispose();
    expect(ports.pending[1]!.cancel).toHaveBeenCalledOnce();
  });
  it.each([null, 500, 403, 200, 400])(
    'normalizes transport status %s and announces shared failures',
    async (status) => {
      const notifications = fakeNotifications();
      const http = {
        request: vi.fn(async () => reply({ ok: true }, status)),
      } as unknown as ConstructorParameters<typeof ApiService>[0];
      const service = new ApiService(http, notifications);
      expect((await service.request('/path')).status).toBe(
        [null, 500, 403].includes(status) ? null : status,
      );
      await service.request('/api/v2/contact/', 'POST', {});
      await service.request('/x', 'PATCH', {});
      expect(http.request).toHaveBeenLastCalledWith('/x', 'PATCH', {}, true);
    },
  );
});
describe('contact submission', () => {
  it('requires fields, clears their errors, prevents duplicate submission, and clears a successful draft', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ContactService(api, notifications);
    await service.submit();
    expect(service.getSnapshot().errors).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      message: 'Message is required',
    });
    service.change('name', 'Visitor');
    await service.submit();
    expect(service.getSnapshot().errors.name).toBeUndefined();
    service.change('email', 'visitor@example.invalid');
    service.change('message', 'Hello');
    api.replies.push(reply({}));
    const pending = service.submit();
    expect(service.getSnapshot().submitting).toBe(true);
    await service.submit();
    expect(api.request).toHaveBeenCalledOnce();
    await pending;
    expect(api.request).toHaveBeenCalledWith('/api/v2/contact/', 'POST', {
      name: 'Visitor',
      email: 'visitor@example.invalid',
      message: 'Hello',
    });
    expect(service.getSnapshot()).toMatchObject({
      submitting: false,
      draft: { name: '', email: '', message: '' },
    });
  });
  it.each([400, null])('retains a failed draft on %s', async (status) => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ContactService(api, notifications);
    service.change('name', 'Visitor');
    service.change('email', 'broken');
    service.change('message', 'Hello');
    api.replies.push(reply({ email: ['Invalid'] }, status));
    await service.submit();
    expect(service.getSnapshot().draft.email).toBe('broken');
    expect(service.getSnapshot().submitting).toBe(false);
    if (status === 400)
      expect(service.getSnapshot().errors.email).toEqual(['Invalid']);
  });
  it('handles an empty validation body', async () => {
    const api = fakeApi();
    const service = new ContactService(api, fakeNotifications());
    for (const key of ['name', 'email', 'message'] as const)
      service.change(key, 'X');
    api.replies.push(reply(null, 400));
    await service.submit();
    expect(service.getSnapshot().errors).toEqual({});
  });
});
describe('sessions', () => {
  it('requires credentials, records form errors, delays successful login and logs out', async () => {
    const ports = fixturePorts();
    const notifications = fakeNotifications();
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      notifications,
      ports.clock,
    );
    await service.login();
    expect(service.getSnapshot().errors.username).toBe('Username is required');
    service.change('username', 'Editor');
    await service.login();
    expect(service.getSnapshot().errors.password).toBe('Password is required');
    service.change('password', 'Password');
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ detail: 'Invalid' }, 400),
    );
    await service.login();
    expect(service.getSnapshot().errors.form).toBe('Invalid');
    vi.mocked(ports.http.request).mockResolvedValueOnce(reply({}, 400));
    await service.login();
    expect(service.getSnapshot().errors.form).toBe('');
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ token: 'abc' }),
    );
    await service.login();
    expect(ports.tokens.read()).toBeNull();
    expect(ports.pending[0]!.milliseconds).toBe(1000);
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ isAuthenticated: true }),
    );
    ports.pending[0]!.callback();
    await tick();
    expect(ports.tokens.read()).toBe('abc');
    expect(service.getSnapshot().authenticated).toBe(true);
    vi.mocked(ports.http.request).mockResolvedValueOnce(reply({}));
    await service.logout();
    expect(ports.tokens.read()).toBeNull();
    expect(ports.navigation.go).toHaveBeenCalledWith('/login');
  });
  it.each([400, 500])(
    'retains authentication when logout fails with %s',
    async (status) => {
      const ports = fixturePorts();
      ports.tokens.write('abc');
      vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, status));
      const notifications = fakeNotifications();
      const service = new SessionService(
        ports.http,
        ports.tokens,
        ports.navigation,
        notifications,
        ports.clock,
      );
      await service.logout();
      expect(service.getSnapshot().authenticated).toBe(true);
      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Error',
        content: expect.stringContaining("couldn't log you off"),
        flavor: 'error',
      });
    },
  );
  it('validates on pathname and storage changes, ignores hash changes and cleans subscriptions', async () => {
    const ports = fixturePorts();
    ports.tokens.write('abc');
    vi.mocked(ports.http.request).mockResolvedValue(
      reply({ isAuthenticated: true }),
    );
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    const stop = service.start();
    await tick();
    service.navigate('/#Music');
    expect(ports.http.request).toHaveBeenCalledTimes(1);
    service.navigate('/voiceover');
    await tick();
    expect(ports.http.request).toHaveBeenCalledTimes(2);
    ports.storageChanged();
    await tick();
    expect(ports.http.request).toHaveBeenCalledTimes(3);
    stop();
  });
  it('expires browser credentials after failed validation without revoking the server token', async () => {
    const ports = fixturePorts();
    ports.tokens.write('abc');
    vi.mocked(ports.http.request).mockResolvedValue(reply(null, null));
    const notifications = fakeNotifications();
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      notifications,
      ports.clock,
    );
    const stop = service.start();
    await tick();
    expect(service.getSnapshot().authenticated).toBe(false);
    expect(ports.tokens.read()).toBeNull();
    expect(ports.http.request).not.toHaveBeenCalledWith(
      '/api/v2/session/logout/',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Session has expired',
      content: 'Please re-log in.',
      flavor: 'error',
    });
    stop();
  });
  it('redirects an anonymous CMS request but allows other anonymous pages', async () => {
    const ports = fixturePorts();
    ports.navigation.go('/cms');
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    const stop = service.start();
    await tick();
    expect(ports.navigation.location()).toBe('/login?returnTo=%2Fcms');
    stop();
  });
  it.each([200, null, 500])(
    'does not authenticate an unsuccessful login %s',
    async (status) => {
      const ports = fixturePorts();
      vi.mocked(ports.http.request).mockResolvedValue(reply({}, status));
      const service = new SessionService(
        ports.http,
        ports.tokens,
        ports.navigation,
        fakeNotifications(),
        ports.clock,
      );
      service.change('username', 'E');
      service.change('password', 'P');
      await service.login();
      expect(ports.tokens.read()).toBeNull();
      expect(service.getSnapshot().submitting).toBe(false);
    },
  );
});
it('preserves login network-error notifications', async () => {
  const ports = fixturePorts();
  const notifications = fakeNotifications();
  const service = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    notifications,
    ports.clock,
  );
  service.change('username', 'Editor');
  service.change('password', 'Password');
  vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, null));
  await service.login();
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Error',
    content: 'Network error',
    flavor: 'error',
  });
});
it('preserves browser logout after a transport failure while the server request is unfulfilled', async () => {
  const ports = fixturePorts();
  ports.tokens.write('abc');
  const notifications = fakeNotifications();
  const service = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    notifications,
    ports.clock,
  );
  vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, null));
  await service.logout();
  expect(ports.tokens.read()).toBeNull();
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Error',
    content: 'Network error',
    flavor: 'error',
  });
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Goodbye!',
    content: 'Successfully logged off',
    flavor: 'success',
  });
});
