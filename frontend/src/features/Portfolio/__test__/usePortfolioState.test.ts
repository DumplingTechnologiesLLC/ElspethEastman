import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import { aPageDTO } from '../../../../../test/contentFixtures';
import { toPage } from '../../../application/mappers/contentPage';
import { usePortfolioState } from '../usePortfolioState';

const home = toPage(aPageDTO('home')),
  voice = toPage(aPageDTO('voiceover'));
it('preserves selection and anchors when switching modes and never mounts an editor on a missing route', () => {
  const { services, site } = mockServices();
  const hook = renderHook(usePortfolioState, { initialProps: { services } });
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      path: '/voiceover?role=00000000-0000-4000-8000-000000000028#roles',
      pages: [home, voice],
      status: 'ready',
      authenticated: true,
      route: {
        type: 'page',
        page: voice,
        editor: false,
        selectedId: '00000000-0000-4000-8000-000000000028',
        anchor: '#roles',
      },
    }),
  );
  expect(hook.result.current.toggleHref).toBe(
    '/cms/voiceover?role=00000000-0000-4000-8000-000000000028#roles',
  );
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: { type: 'missing', editor: true },
    }),
  );
  expect(hook.result.current.editor).toBe(false);
});
it('owns registry/session lifecycles and projects current routes and canonical navigation', () => {
  const { services, site, session, stopSession } = mockServices();
  const hook = renderHook(usePortfolioState, { initialProps: { services } });
  expect(site.start).toHaveBeenCalledOnce();
  expect(session.start).toHaveBeenCalledOnce();
  expect(hook.result.current).toMatchObject({
    screen: 'loading',
    pageId: '',
    pageKind: null,
    title: 'Elspeth Eastman',
    homeHref: '/',
    toggleHref: '/cms',
    links: [],
    year: 2026,
  });
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      status: 'ready',
      pages: [home, voice],
      route: {
        type: 'page',
        editor: false,
        page: voice,
        selectedId: null,
        anchor: '',
      },
    }),
  );
  expect(hook.result.current).toMatchObject({
    screen: 'page',
    title: 'voiceover · Elspeth Eastman',
    pageId: '00000000-0000-4000-8000-000000000002',
    pageKind: 'voiceover',
    toggleHref: '/cms/voiceover',
    links: [
      {
        id: '00000000-0000-4000-8000-000000000002',
        href: '/voiceover',
        active: true,
      },
    ],
  });
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        editor: true,
        page: voice,
        selectedId: null,
        anchor: '',
      },
    }),
  );
  expect(hook.result.current.screen).toBe('authenticating');
  act(() => site.publish({ ...site.getSnapshot(), authenticated: true }));
  expect(hook.result.current).toMatchObject({
    editor: true,
    toggleHref: '/voiceover',
    homeHref: '/cms',
    links: [{ href: '/cms/voiceover' }],
  });
  act(() => site.publish({ ...site.getSnapshot(), route: { type: 'login' } }));
  expect(hook.result.current).toMatchObject({
    screen: 'login',
    editor: false,
    pageKind: null,
  });
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: { type: 'missing', editor: false },
    }),
  );
  expect(hook.result.current.screen).toBe('missing');
  act(() => site.publish({ ...site.getSnapshot(), status: 'loading' }));
  expect(hook.result.current.screen).toBe('loading');
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      status: 'error',
      error: { status: 503, detail: 'Offline', fields: {} },
    }),
  );
  expect(hook.result.current).toMatchObject({
    screen: 'error',
    error: 'Offline',
  });
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      status: 'ready',
      route: {
        type: 'page',
        editor: false,
        page: home,
        selectedId: null,
        anchor: '',
      },
    }),
  );
  expect(hook.result.current.title).toBe('Elspeth Eastman');
  expect(hook.result.current.navigate).toBe(site.navigate);
  expect(hook.result.current.retry).toBe(site.load);
  expect(hook.result.current.logout).toBe(session.logout);
  hook.unmount();
  expect(stopSession).toHaveBeenCalledOnce();
});
