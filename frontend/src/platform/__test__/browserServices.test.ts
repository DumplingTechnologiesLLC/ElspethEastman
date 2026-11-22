import { renderHook } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { browserServices, tokenKey } from '../browserServices';
import { useSessionService } from '../../hooks/useSessionService';
import { useUIAlertService } from '../../hooks/useUIAlertService';
import { useContactService } from '../../hooks/useContactService';
import { useSkillsService } from '../../hooks/useSkillsService';
import { useProjectsService } from '../../hooks/useProjectsService';
import { useExperienceService } from '../../hooks/useExperienceService';
import { useFooterService } from '../../hooks/useFooterService';
import { useSiteService } from '../../hooks/useSiteService';
import { usePageService } from '../../hooks/usePageService';
import { useMediaService } from '../../hooks/useMediaService';
import { useContentEditorService } from '../../hooks/useContentEditorService';

import { fixturePorts } from '../../../../test/fakes';
it('creates independent request-scoped domain aggregates with interface-based accessors', () => {
  const a = fixturePorts();
  const first = a.services();
  const second = a.services();
  expect(first.session).not.toBe(second.session);
  expect(first.notifications).not.toBe(second.notifications);
  expect(first.site).not.toBe(second.site);
  expect(useSiteService(first)).toBe(first.site);
  expect(useMediaService(first)).toBe(first.media);
  expect(first.media).not.toBe(second.media);
  expect(first.page('00000000-0000-4000-8000-000000000001')).not.toBe(
    second.page('00000000-0000-4000-8000-000000000001'),
  );
  expect(first.page('00000000-0000-4000-8000-000000000001')).not.toBe(
    first.page('00000000-0000-4000-8000-000000000002'),
  );
  expect(first.editor('00000000-0000-4000-8000-000000000001')).not.toBe(
    second.editor('00000000-0000-4000-8000-000000000001'),
  );
  expect(first.editor('00000000-0000-4000-8000-000000000001')).not.toBe(
    first.editor('00000000-0000-4000-8000-000000000002'),
  );
  first
    .editor('00000000-0000-4000-8000-000000000001')
    .open({ type: 'settings' });
  expect(
    first.editor('00000000-0000-4000-8000-000000000001').getSnapshot().draft,
  ).toBeNull();
  const editor = renderHook(useContentEditorService, {
    initialProps: {
      services: first,
      pageId: '00000000-0000-4000-8000-000000000001',
    },
  });
  expect(editor.result.current).toBe(
    first.editor('00000000-0000-4000-8000-000000000001'),
  );
  editor.rerender({
    services: first,
    pageId: '00000000-0000-4000-8000-000000000001',
  });
  const page = renderHook(usePageService, {
    initialProps: {
      services: first,
      pageId: '00000000-0000-4000-8000-000000000001',
    },
  });
  expect(page.result.current).toBe(
    first.page('00000000-0000-4000-8000-000000000001'),
  );
  page.rerender({
    services: first,
    pageId: '00000000-0000-4000-8000-000000000001',
  });
  expect(page.result.current.getSnapshot()).toMatchObject({
    pageId: '00000000-0000-4000-8000-000000000001',
    status: 'idle',
  });
  expect(useSessionService(first)).toBe(first.session);
  expect(useUIAlertService(first)).toBe(first.notifications);
  expect(useContactService(first)).toBe(first.contact);
  const skills = renderHook(useSkillsService, {
    initialProps: { services: first, editor: true },
  });
  const original = skills.result.current;
  skills.rerender({ services: first, editor: true });
  expect(skills.result.current).toBe(original);
  expect(original.getSnapshot().loaded).toBe(false);
  expect(
    renderHook(useProjectsService, {
      initialProps: { services: first, mode: 'all' as const },
    }).result.current.getSnapshot().projects,
  ).toEqual([]);
  expect(
    renderHook(useExperienceService, {
      initialProps: { services: first },
    }).result.current.getSnapshot().year,
  ).toBe(2026);
  expect(
    renderHook(useFooterService, {
      initialProps: { services: first },
    }).result.current.getSnapshot().loaded,
  ).toBe(false);
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
  services.session.navigate(
    '/projects?role=00000000-0000-4000-8000-000000000004#roles',
  );
  expect(services.session.getSnapshot().path).toBe(
    '/projects?role=00000000-0000-4000-8000-000000000004#roles',
  );
  const historyLength = window.history.length;
  services.session.replace(
    '/projects?role=00000000-0000-4000-8000-000000000005#roles',
  );
  expect(window.history.length).toBe(historyLength);
  expect(services.session.getSnapshot().path).toBe(
    '/projects?role=00000000-0000-4000-8000-000000000005#roles',
  );
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.dispatchEvent(new StorageEvent('storage'));
  await Promise.resolve();
  const projects = services.projects('editor');
  await projects.remove('00000000-0000-4000-8000-000000000001');
  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining('delete this item'),
  );
  fetcher.mockImplementation(async () => new Response('{}', { status: 200 }));
  await services.session.logout();
  expect(window.sessionStorage.getItem(tokenKey)).toBeNull();
  services.notifications.show({ title: 'A', content: 'B', flavor: 'info' });
  vi.advanceTimersByTime(6000);
  expect(services.notifications.getSnapshot()).toEqual([]);
  stop();
  services.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
