import { expect, it, vi } from 'vitest';
import { aPageDTO } from '../../../../../test/contentFixtures';
import { fakeNotifications } from '../../../../../test/fakes';
import { mockServices } from '../../../../../test/mockServices';
import { PageKind } from '../../../domain/models/Page';
import type { Page } from '../../../domain/models/Page';
import type { ContentRepository } from '../../../domain/ports/ContentRepository';
import type { ContentResult } from '../../../domain/models/ContentResult';
import { toPage } from '../../mappers/contentPage';
import { SiteService } from '../SiteService';

const pages = [
  toPage(aPageDTO('home')),
  toPage(aPageDTO('voiceover')),
  toPage(aPageDTO('music')),
  toPage(aPageDTO('press')),
];
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

function fixture(path = '/', authenticated = false) {
  const { session } = mockServices();
  session.publish({ ...session.getSnapshot(), path, authenticated });
  const repository = {
    site: vi
      .fn<ContentRepository['site']>()
      .mockResolvedValue({ ok: true, value: pages }),
  };
  const alerts = fakeNotifications();
  return {
    repository,
    session,
    alerts,
    site: new SiteService(repository, session, alerts, 2026),
  };
}

it('loads the registry once and resolves subsequent path, selection, and auth changes from memory', async () => {
  const { site, repository, session } = fixture(
    '/voiceover?role=00000000-0000-4000-8000-000000000028',
  );
  const stop = site.start();
  expect(site.getSnapshot().status).toBe('loading');
  await tick();
  expect(site.getSnapshot()).toMatchObject({
    status: 'ready',
    route: {
      type: 'page',
      page: { kind: PageKind.Voiceover },
      selectedId: '00000000-0000-4000-8000-000000000028',
    },
  });
  session.publish({ ...session.getSnapshot(), username: 'Editor' });
  expect(repository.site).toHaveBeenCalledOnce();
  session.publish({
    ...session.getSnapshot(),
    path: '/cms/press?entry=00000000-0000-4000-8000-00000000000c#coverage',
    authenticated: true,
  });
  expect(site.getSnapshot()).toMatchObject({
    authenticated: true,
    route: {
      type: 'page',
      editor: true,
      selectedId: '00000000-0000-4000-8000-00000000000c',
      anchor: '#coverage',
    },
  });
  session.publish({ ...session.getSnapshot(), authenticated: false });
  expect(site.getSnapshot().authenticated).toBe(false);
  expect(repository.site).toHaveBeenCalledOnce();
  stop();
  expect(session.stop).toHaveBeenCalledOnce();
});

it('deduplicates overlapping registry loads and resolves the most recent location', async () => {
  const { site, repository, session } = fixture('/voiceover');
  let release!: () => void;
  repository.site.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true, value: pages });
      }),
  );
  const stop = site.start();
  session.publish({
    ...session.getSnapshot(),
    path: '/press?entry=00000000-0000-4000-8000-00000000000c',
  });
  expect(repository.site).toHaveBeenCalledOnce();
  release();
  await tick();
  expect(site.getSnapshot()).toMatchObject({
    status: 'ready',
    route: {
      type: 'page',
      page: { kind: PageKind.Press },
      selectedId: '00000000-0000-4000-8000-00000000000c',
    },
  });
  stop();
});

it('keeps stopped loads from publishing while retaining a reusable registry cache', async () => {
  const { site, repository, alerts } = fixture();
  let release!: () => void;
  repository.site.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true, value: pages });
      }),
  );
  const stop = site.start();
  stop();
  release();
  await tick();
  expect(site.getSnapshot().status).toBe('loading');
  expect(alerts.show).not.toHaveBeenCalled();
  await site.load();
  expect(site.getSnapshot().status).toBe('ready');
  expect(repository.site).toHaveBeenCalledOnce();
});

it('preserves failure details, permits retry, and contains a rejected repository promise', async () => {
  const { site, repository, alerts } = fixture();
  const failure: ContentResult<readonly Page[]> = {
    ok: false,
    error: { status: 503, detail: 'Temporarily unavailable', fields: {} },
  };
  repository.site.mockResolvedValueOnce(failure);
  await site.load();
  expect(site.getSnapshot()).toMatchObject({
    status: 'error',
    error: failure.error,
  });
  expect(alerts.show).toHaveBeenCalledWith({
    title: 'Could not load the site',
    content: 'Temporarily unavailable',
    flavor: 'error',
  });
  repository.site.mockRejectedValueOnce(new Error('Adapter interrupted'));
  await site.load();
  expect(site.getSnapshot()).toMatchObject({
    status: 'error',
    error: { status: null },
  });
  await site.load();
  expect(site.getSnapshot()).toMatchObject({ status: 'ready', error: null });
});

it('replaces the current URL after a rename without changing identity or refetching', async () => {
  const { site, repository, session } = fixture(
    '/cms/voiceover?role=00000000-0000-4000-8000-000000000028#roles',
    true,
  );
  await site.load();
  const renamed = { ...pages[1]!, title: 'Characters', slug: 'characters' };
  site.updatePage(renamed);
  expect(session.replace).toHaveBeenCalledWith(
    '/cms/characters?role=00000000-0000-4000-8000-000000000028#roles',
  );
  expect(site.getSnapshot()).toMatchObject({
    path: '/cms/characters?role=00000000-0000-4000-8000-000000000028#roles',
    route: {
      type: 'page',
      page: renamed,
      selectedId: '00000000-0000-4000-8000-000000000028',
    },
  });
  session.publish({
    ...session.getSnapshot(),
    path: '/cms/characters?role=00000000-0000-4000-8000-000000000028#roles',
  });
  await site.load();
  expect(
    site.getSnapshot().pages.find((page) => page.id === renamed.id),
  ).toEqual(renamed);
  expect(repository.site).toHaveBeenCalledOnce();
});

it('updates other page labels without moving the current location and rejects identity changes', async () => {
  const { site, session } = fixture('/login');
  await site.load();
  site.updatePage({ ...pages[1]!, title: 'Characters' });
  expect(site.getSnapshot().pages[1]!.title).toBe('Characters');
  expect(session.replace).not.toHaveBeenCalled();
  site.updatePage({ ...pages[0]!, id: '00000000-0000-4000-8000-00000001869f' });
  site.updatePage({ ...pages[1]!, kind: PageKind.Music });
  expect(site.getSnapshot().pages).toHaveLength(4);
  expect(site.getSnapshot().pages[1]!.kind).toBe(PageKind.Voiceover);
  session.publish({ ...session.getSnapshot(), path: '/music' });
  await site.load();
  site.updatePage({ ...pages[1]!, title: 'Roles' });
  expect(site.getSnapshot().path).toBe('/music');
  site.updatePage({ ...pages[2]!, title: 'Original music' });
  expect(session.replace).not.toHaveBeenCalled();
});

it('selects and closes loaded detail locations while ignoring non-selectable routes', async () => {
  const { site, session } = fixture('/voiceover?other=keep#roles');
  await site.load();
  site.select('00000000-0000-4000-8000-000000000028');
  expect(session.navigate).toHaveBeenLastCalledWith(
    '/voiceover?other=keep&role=00000000-0000-4000-8000-000000000028#roles',
  );
  session.publish({
    ...session.getSnapshot(),
    path: '/press?entry=00000000-0000-4000-8000-00000000000c#coverage',
  });
  await site.load();
  site.select(null);
  expect(session.navigate).toHaveBeenLastCalledWith('/press#coverage');
  session.navigate.mockClear();
  for (const path of ['/music', '/login', '/missing']) {
    session.publish({ ...session.getSnapshot(), path });
    // oxlint-disable-next-line no-await-in-loop -- Resolve each route before testing its selection policy.
    await site.load();
    site.select('00000000-0000-4000-8000-000000000028');
  }
  expect(session.navigate).not.toHaveBeenCalled();
  site.navigate('/bio');
  expect(session.navigate).toHaveBeenCalledWith('/bio');
});

it('keeps the originating credential revision when a forbidden registry read is shared', async () => {
  const { site, repository, session, alerts } = fixture('/cms/press', true);
  session.revision.mockReturnValue(4);
  let release!: () => void;
  repository.site.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () =>
          resolve({
            ok: false,
            error: { status: 403, detail: 'Expired', fields: {} },
          });
      }),
  );
  const first = site.load();
  session.revision.mockReturnValue(5);
  const second = site.load();
  release();
  await Promise.all([first, second]);
  expect(repository.site).toHaveBeenCalledOnce();
  expect(session.expire).toHaveBeenCalledWith('/cms/press', 4);
  expect(alerts.show).not.toHaveBeenCalled();
});
