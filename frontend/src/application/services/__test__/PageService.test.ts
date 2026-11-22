import { expect, it, vi } from 'vitest';
import { aHomeDTO, aVoiceoverDTO } from '../../../../../test/contentFixtures';
import { fakeNotifications } from '../../../../../test/fakes';
import type { ContentRepository } from '../../../domain/ports/ContentRepository';
import type { ContentResult } from '../../../domain/models/ContentResult';
import type { PageContent } from '../../../domain/models/PageContent';
import { toPageContent } from '../../mappers/contentAggregate';
import { PageService } from '../PageService';

const home = toPageContent(aHomeDTO());
const voiceover = toPageContent(aVoiceoverDTO());
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
function fixture() {
  const repository = {
    page: vi
      .fn<ContentRepository['page']>()
      .mockResolvedValue({ ok: true, value: home }),
  };
  const alerts = fakeNotifications();
  return {
    repository,
    alerts,
    service: new PageService(
      '00000000-0000-4000-8000-000000000001',
      repository,
      alerts,
    ),
  };
}

it('loads one aggregate and reuses it across subscribers without refetching', async () => {
  const { service, repository } = fixture();
  const first = service.start();
  const second = service.start();
  expect(service.getSnapshot()).toMatchObject({
    pageId: '00000000-0000-4000-8000-000000000001',
    status: 'loading',
    content: null,
  });
  await tick();
  expect(service.getSnapshot()).toMatchObject({
    status: 'ready',
    content: home,
    error: null,
  });
  expect(repository.page).toHaveBeenCalledExactlyOnceWith(
    '00000000-0000-4000-8000-000000000001',
  );
  first();
  await service.load();
  expect(service.getSnapshot().content).toBe(home);
  second();
  const restart = service.start();
  expect(service.getSnapshot().status).toBe('ready');
  expect(repository.page).toHaveBeenCalledOnce();
  restart();
});

it('shares an in-flight request across strict mount/cleanup/remount and ignores stale completion', async () => {
  const { service, repository } = fixture();
  let release!: () => void;
  repository.page.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ ok: true, value: home });
      }),
  );
  const first = service.start();
  first();
  const second = service.start();
  release();
  await tick();
  expect(repository.page).toHaveBeenCalledOnce();
  expect(service.getSnapshot()).toMatchObject({
    status: 'ready',
    content: home,
  });
  second();
});

it('contains a late failure after its final subscriber stops', async () => {
  const { service, repository, alerts } = fixture();
  let release!: () => void;
  repository.page.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () =>
          resolve({
            ok: false,
            error: { status: 503, detail: 'Unavailable', fields: {} },
          });
      }),
  );
  const stop = service.start();
  stop();
  release();
  await tick();
  expect(service.getSnapshot().status).toBe('loading');
  expect(alerts.show).not.toHaveBeenCalled();
  await service.load();
  expect(service.getSnapshot().status).toBe('ready');
});

it('preserves an HTTP failure, permits retry, and contains rejected repository promises', async () => {
  const { service, repository, alerts } = fixture();
  const failure: ContentResult<PageContent> = {
    ok: false,
    error: { status: 404, detail: 'Page missing', fields: {} },
  };
  repository.page.mockResolvedValueOnce(failure);
  await service.load();
  expect(service.getSnapshot()).toMatchObject({
    status: 'error',
    error: failure.error,
    content: null,
  });
  expect(alerts.show).toHaveBeenCalledWith({
    title: 'Could not load the page',
    content: 'Page missing',
    flavor: 'error',
  });
  repository.page.mockRejectedValueOnce(new Error('Adapter interrupted'));
  await service.load();
  expect(service.getSnapshot()).toMatchObject({
    status: 'error',
    error: { status: null },
  });
  await service.load();
  expect(service.getSnapshot()).toMatchObject({ status: 'ready', error: null });
});

it('keeps page identity and caches isolated between page services', async () => {
  const { service, repository } = fixture();
  repository.page.mockResolvedValueOnce({ ok: true, value: voiceover });
  await service.load();
  expect(service.getSnapshot()).toMatchObject({
    pageId: '00000000-0000-4000-8000-000000000001',
    status: 'error',
    content: null,
  });
  await service.load();
  const other = new PageService(
    '00000000-0000-4000-8000-000000000002',
    { page: vi.fn().mockResolvedValue({ ok: true, value: voiceover }) },
    fakeNotifications(),
  );
  await other.load();
  expect(service.getSnapshot().content).toBe(home);
  expect(other.getSnapshot().content).toBe(voiceover);
});
