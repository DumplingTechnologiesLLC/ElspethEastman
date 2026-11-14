import { it, expect, vi } from 'vitest';
import { browserServices, tokenKey } from '../browserServices';
import {
  useSessionService,
  useNotificationService,
  useContactService,
  useSkillsService,
  useProjectsService,
  useExperienceService,
  useFooterService,
} from '../../domain/ServiceContainer';
import { fixturePorts } from '../../../../test/fakes';
it('creates independent request-scoped domain aggregates with interface-based accessors', () => {
  const a = fixturePorts();
  const first = a.services();
  const second = a.services();
  expect(first.session).not.toBe(second.session);
  expect(first.notifications).not.toBe(second.notifications);
  expect(useSessionService(first)).toBe(first.session);
  expect(useNotificationService(first)).toBe(first.notifications);
  expect(useContactService(first)).toBe(first.contact);
  expect(useSkillsService(first)(true).getSnapshot().loaded).toBe(false);
  expect(useProjectsService(first)('all').getSnapshot().projects).toEqual([]);
  expect(useExperienceService(first)().getSnapshot().year).toBe(2026);
  expect(useFooterService(first)().getSnapshot().loaded).toBe(false);
  first.dispose();
});
it('binds navigation, token storage, confirmation and timers to its owning window', async () => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(
      async (path) =>
        new Response(
          JSON.stringify(
            String(path).includes('login')
              ? { token: 'abc' }
              : { isAuthenticated: true },
          ),
          { status: 200 },
        ),
    );
  vi.stubGlobal('fetch', fetcher);
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const services = browserServices(window);
  expect(services.experience().getSnapshot().year).toBe(
    new Date().getFullYear(),
  );
  const stop = services.session.start();
  services.session.change('username', 'Editor');
  services.session.change('password', 'Password');
  await services.session.login();
  vi.advanceTimersByTime(1000);
  await Promise.resolve();
  expect(window.sessionStorage.getItem(tokenKey)).toBe('abc');
  services.session.navigate('/projects');
  expect(services.session.getSnapshot().path).toBe('/projects');
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.dispatchEvent(new StorageEvent('storage'));
  await Promise.resolve();
  const projects = services.projects('editor');
  await projects.remove(1);
  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining('delete this item'),
  );
  fetcher.mockImplementation(async () => new Response('{}', { status: 200 }));
  await services.session.logout();
  expect(window.sessionStorage.getItem(tokenKey)).toBeNull();
  services.notifications.show('A', 'B', 'info');
  vi.advanceTimersByTime(6000);
  expect(services.notifications.getSnapshot()).toEqual([]);
  stop();
  services.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
