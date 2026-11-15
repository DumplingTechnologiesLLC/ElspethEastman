import { expect, it } from 'vitest';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aMusicDTO,
  aBioDTO,
  anEntryDTO,
} from '../../../../../test/contentFixtures';
import { image } from '../../../../../test/contentWriteCases';
import { mockContentRepository } from '../../../../../test/mockContentRepository';
import { mockServices } from '../../../../../test/mockServices';
import { toPageContent } from '../../mappers/contentAggregate';
import type { PageContent } from '../../../domain/models/PageContent';
import { PageCollection } from '../../../domain/models/PageCollection';
import { PageService } from '../PageService';

const voice = toPageContent(aVoiceoverDTO());
const music = toPageContent(aMusicDTO());
it('moves a member before another member or to the end using the full current collection', async () => {
  const content = toPageContent(
    aVoiceoverDTO({
      roles: [anEntryDTO(), anEntryDTO({ id: 42 }), anEntryDTO({ id: 43 })],
    }),
  );
  const { service, repository } = await fixture(content);
  repository.reorder.mockImplementation(async (input) => ({
    ok: true,
    value: input,
  }));
  const scope = { collection: PageCollection.ContentEntries, section: null };
  expect((await service.move({ ...scope, itemId: 43, beforeId: 40 })).ok).toBe(
    true,
  );
  expect(repository.reorder).toHaveBeenLastCalledWith({
    ...scope,
    pageId: 2,
    orderedIds: [43, 40, 42],
  });
  expect(
    (await service.move({ ...scope, itemId: 43, beforeId: null })).ok,
  ).toBe(true);
  expect(repository.reorder).toHaveBeenLastCalledWith({
    ...scope,
    pageId: 2,
    orderedIds: [40, 42, 43],
  });
  const rejected = await Promise.all(
    [
      { itemId: 999, beforeId: 40 },
      { itemId: 40, beforeId: 999 },
      { itemId: 40, beforeId: 40 },
    ].map((move) => service.move({ ...scope, ...move })),
  );
  expect(rejected.every((result) => !result.ok)).toBe(true);
  expect(repository.reorder).toHaveBeenCalledTimes(2);
  const unloaded = new PageService(
    2,
    repository,
    mockServices().notifications,
    mockServices().site,
    mockServices().session,
  );
  expect(
    (await unloaded.move({ ...scope, itemId: 40, beforeId: null })).ok,
  ).toBe(false);
  expect(
    (
      await service.move({
        collection: PageCollection.Releases,
        section: null,
        itemId: 40,
        beforeId: null,
      })
    ).ok,
  ).toBe(false);
});
const practice = {
  eyebrow: 'Practice',
  title: 'Cello',
  description: 'Notes',
  image,
  facts: [],
  action: { label: 'Watch', url: 'https://example.invalid/watch' },
};
async function fixture(content: PageContent = voice) {
  const repository = mockContentRepository();
  repository.page.mockResolvedValue({ ok: true, value: content });
  const { notifications, site, session } = mockServices();
  const service = new PageService(
    content.page.id,
    repository,
    notifications,
    site,
    session,
  );
  await service.load();
  return { service, repository, notifications };
}
it('reports rejected inline promotion and ordering instead of silently dropping validation errors', async () => {
  const { service, repository, notifications } = await fixture();
  const failure = {
    ok: false,
    error: {
      status: 400,
      detail: 'Changed',
      fields: { itemId: ['This item changed. Please refresh and try again.'] },
    },
  } as const;
  repository.feature.mockResolvedValueOnce(failure);
  await service.feature(40);
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({
      content: 'This item changed. Please refresh and try again.',
    }),
  );
  notifications.show.mockClear();
  repository.reorder.mockResolvedValueOnce(failure);
  await service.reorder({
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [40],
  });
  expect(notifications.show).toHaveBeenCalledOnce();
  expect(service.getSnapshot().content).toBe(voice);
});

it('promotes an eligible existing entry and clears promotion without changing identity or order', async () => {
  const { service, repository } = await fixture();
  repository.feature.mockResolvedValueOnce({
    ok: true,
    value: { pageId: 2, itemId: 40 },
  });
  expect((await service.feature(40)).ok).toBe(true);
  const promoted = service.getSnapshot().content;
  expect(promoted).toMatchObject({
    feature: { itemId: 40 },
    roles: [{ id: 40, isFeatured: true, sortOrder: 0 }],
  });
  repository.feature.mockResolvedValueOnce({
    ok: true,
    value: { pageId: 2, itemId: null },
  });
  expect((await service.feature(null)).ok).toBe(true);
  expect(service.getSnapshot().content).toMatchObject({
    feature: { itemId: null },
    roles: [{ id: 40, isFeatured: false }],
  });
  expect(repository.page).toHaveBeenCalledOnce();
});

it('rejects unsupported promotion, unknown entries, and invalid canonical acknowledgements', async () => {
  const { service, repository } = await fixture();
  expect((await service.feature(999)).ok).toBe(false);
  expect(repository.feature).not.toHaveBeenCalled();
  repository.feature.mockResolvedValueOnce({
    ok: true,
    value: { pageId: 99, itemId: 40 },
  });
  expect((await service.feature(40)).ok).toBe(false);
  expect(service.getSnapshot().content).toBe(voice);
  const other = await fixture(music);
  expect((await other.service.feature(null)).ok).toBe(false);
});

it('saves the separate practice singleton only on Music and retains its canonical values', async () => {
  const { service, repository } = await fixture(music);
  if (music.kind !== 'music') throw new Error('Music fixture required');
  repository.practice.mockResolvedValueOnce({
    ok: true,
    value: { ...music.feature, title: 'Canonical practice' },
  });
  expect((await service.practice(practice)).ok).toBe(true);
  expect(repository.practice).toHaveBeenCalledExactlyOnceWith({
    ...practice,
    pageId: music.page.id,
  });
  expect(service.getSnapshot().content).toMatchObject({
    feature: { title: 'Canonical practice' },
    releases: music.releases,
  });
  const other = await fixture();
  expect((await other.service.practice(practice)).ok).toBe(false);
  expect(other.repository.practice).not.toHaveBeenCalled();
});

it('reorders only complete scoped membership, preserving all canonical records', async () => {
  const { service, repository } = await fixture();
  const input = {
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [40],
  };
  repository.reorder.mockResolvedValueOnce({
    ok: true,
    value: { ...input, pageId: 2 },
  });
  expect((await service.reorder(input)).ok).toBe(true);
  expect(repository.reorder).toHaveBeenCalledExactlyOnceWith({
    ...input,
    pageId: 2,
  });
  expect(service.getSnapshot().content).toMatchObject({
    roles: [{ id: 40, sortOrder: 0 }],
  });
  expect((await service.reorder({ ...input, orderedIds: [] })).ok).toBe(false);
  expect(repository.reorder).toHaveBeenCalledOnce();
  repository.reorder.mockResolvedValueOnce({
    ok: true,
    value: { ...input, pageId: 2, collection: PageCollection.Eyebrows },
  });
  expect((await service.reorder(input)).ok).toBe(false);
  repository.reorder.mockResolvedValueOnce({
    ok: true,
    value: { ...input, pageId: 2, section: 'other' },
  });
  expect((await service.reorder(input)).ok).toBe(false);
});

it('supports keyed copy order and independent Bio chapters', async () => {
  const { service, repository } = await fixture(toPageContent(aHomeDTO()));
  const input = {
    collection: PageCollection.Copy,
    section: 'intro',
    orderedIds: [30],
  };
  repository.reorder.mockResolvedValueOnce({
    ok: true,
    value: { ...input, pageId: 1 },
  });
  expect((await service.reorder(input)).ok).toBe(true);
  const bio = await fixture(toPageContent(aBioDTO()));
  const chapters = {
    collection: PageCollection.BioChapters,
    section: null,
    orderedIds: [80],
  };
  bio.repository.reorder.mockResolvedValueOnce({
    ok: true,
    value: { ...chapters, pageId: 6 },
  });
  expect((await bio.service.reorder(chapters)).ok).toBe(true);
});
