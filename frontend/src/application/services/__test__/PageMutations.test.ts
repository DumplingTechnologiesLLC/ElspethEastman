import { expect, it } from 'vitest';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aMusicDTO,
  aStreamingDTO,
  aPressDTO,
  aBioDTO,
  anEntryDTO,
} from '../../../../../test/contentFixtures';
import {
  mockContentRepository,
  type MockCollection,
} from '../../../../../test/mockContentRepository';
import { mockServices } from '../../../../../test/mockServices';
import { fakeNotifications } from '../../../../../test/fakes';
import {
  image,
  eyebrow,
  trivia,
  entry,
  release,
  clip,
  appearance,
  chapter,
  current,
} from '../../../../../test/contentWriteCases';
import type { ContentResult } from '../../../domain/models/ContentResult';
import type { PageContent } from '../../../domain/models/PageContent';
import type { OrderedPageRecord, PageScope } from '../../../domain/models/Page';
import { CopyKind } from '../../../domain/models/PageCopy';
import type {
  PageCollectionController,
  PageController,
} from '../../../domain/ports/PageController';
import { toPageContent } from '../../mappers/contentAggregate';
import { toContentEntry } from '../../mappers/contentEntry';
import {
  eyebrowPolicy,
  triviaPolicy,
  entryPolicy,
  releasePolicy,
  clipPolicy,
  appearancePolicy,
  chapterPolicy,
  currentPolicy,
  type CollectionPolicy,
} from '../pageContent/collections';
import { PageService } from '../PageService';

const home = toPageContent(aHomeDTO());
const voice = toPageContent(aVoiceoverDTO());
const music = toPageContent(aMusicDTO());
const streaming = toPageContent(aStreamingDTO());
const press = toPageContent(aPressDTO());
const bio = toPageContent(aBioDTO());
type Repository = ReturnType<typeof mockContentRepository>;
function fixture(content = home) {
  const repository = mockContentRepository();
  repository.page.mockResolvedValue({ ok: true, value: content });
  const { site, session } = mockServices();
  session.publish({
    ...session.getSnapshot(),
    path: '/cms/voiceover?role=40',
    authenticated: true,
  });
  const alerts = fakeNotifications();
  return {
    repository,
    site,
    session,
    alerts,
    service: new PageService(
      content.page.id,
      repository,
      alerts,
      site,
      session,
    ),
  };
}

interface CollectionCase {
  name: string;
  content: PageContent;
  rows: (content: PageContent) => readonly OrderedPageRecord[] | null;
  prepare: (repository: Repository) => void;
  create: (page: PageController) => Promise<ContentResult<unknown>>;
  update: (page: PageController) => Promise<ContentResult<unknown>>;
  remove: (page: PageController) => Promise<ContentResult<void>>;
  createdInput: (repository: Repository) => unknown;
}
function collectionCase<T extends OrderedPageRecord, Input extends PageScope>(
  name: string,
  content: PageContent,
  policy: CollectionPolicy<T>,
  controller: (page: PageController) => PageCollectionController<T, Input>,
  source: (repository: Repository) => MockCollection<T, Input>,
  input: Omit<Input, 'pageId'>,
  canonical?: T,
): CollectionCase {
  const row = canonical ?? { ...policy.rows(content)![0]!, id: 200 };
  return {
    name,
    content,
    rows: policy.rows,
    prepare: (repository) => {
      const port = source(repository);
      port.create.mockResolvedValue({ ok: true, value: row });
      port.update.mockResolvedValue({
        ok: true,
        value: { ...row, sortOrder: 3 },
      });
      port.remove.mockResolvedValue({ ok: true, value: undefined });
    },
    create: (page) => controller(page).create(input),
    update: (page) => controller(page).update(200, input),
    remove: (page) => controller(page).remove(200),
    createdInput: (repository) => source(repository).create.mock.lastCall![0],
  };
}
const untrustedEyebrow = { ...eyebrow, pageId: 999 };
const cases = [
  collectionCase(
    'eyebrows',
    voice,
    eyebrowPolicy,
    (p) => p.eyebrows,
    (r) => r.eyebrows,
    untrustedEyebrow,
  ),
  collectionCase(
    'trivia',
    voice,
    triviaPolicy,
    (p) => p.trivia,
    (r) => r.trivia,
    trivia,
  ),
  collectionCase(
    'entries',
    voice,
    entryPolicy,
    (p) => p.entries,
    (r) => r.entries,
    entry,
    toContentEntry(anEntryDTO({ id: 200, metadata: [] })),
  ),
  collectionCase(
    'releases',
    music,
    releasePolicy,
    (p) => p.releases,
    (r) => r.releases,
    release,
  ),
  collectionCase(
    'clips',
    streaming,
    clipPolicy,
    (p) => p.clips,
    (r) => r.clips,
    clip,
  ),
  collectionCase(
    'appearances',
    press,
    appearancePolicy,
    (p) => p.appearances,
    (r) => r.appearances,
    appearance,
  ),
  collectionCase(
    'chapters',
    bio,
    chapterPolicy,
    (p) => p.chapters,
    (r) => r.chapters,
    chapter,
  ),
  collectionCase(
    'current work',
    bio,
    currentPolicy,
    (p) => p.currentItems,
    (r) => r.currentItems,
    current,
  ),
];

it.each(cases)(
  'reconciles canonical $name CRUD within the owning page without refetching',
  async (testCase) => {
    const { service, repository } = fixture(testCase.content);
    await service.load();
    testCase.prepare(repository);
    expect(await testCase.create(service)).toMatchObject({
      ok: true,
      value: { id: 200, pageId: service.pageId },
    });
    expect(testCase.createdInput(repository)).toMatchObject({
      pageId: service.pageId,
    });
    expect(
      testCase
        .rows(service.getSnapshot().content!)!
        .some((row) => row.id === 200),
    ).toBe(true);
    expect(await testCase.update(service)).toMatchObject({
      ok: true,
      value: { id: 200, sortOrder: 3 },
    });
    expect(await testCase.remove(service)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(
      testCase
        .rows(service.getSnapshot().content!)!
        .some((row) => row.id === 200),
    ).toBe(false);
    expect(repository.page).toHaveBeenCalledOnce();
    expect(service.getSnapshot()).toMatchObject({
      status: 'ready',
      mutating: false,
    });
  },
);

it('updates registry metadata and keyed copy/image content from canonical responses', async () => {
  const { service, repository, site } = fixture();
  await service.load();
  const page = { ...home.page, title: 'Canonical title' };
  repository.metadata.mockResolvedValue({ ok: true, value: page });
  await service.metadata({ title: 'Submitted' });
  expect(site.updatePage).toHaveBeenCalledExactlyOnceWith(page);
  expect(service.getSnapshot().content!.page.title).toBe('Canonical title');
  const block = {
    ...home.copy[0]!,
    id: 31,
    key: 'new',
    value: 'Canonical copy',
  };
  repository.copy.create.mockResolvedValue({ ok: true, value: block });
  const input = {
    pageId: 999,
    key: 'new',
    section: 'intro',
    kind: CopyKind.Body,
    value: 'Submitted',
  };
  await service.copy.create(input);
  expect(repository.copy.create).toHaveBeenCalledWith({ ...input, pageId: 1 });
  repository.copy.update.mockResolvedValue({
    ok: true,
    value: { ...block, value: 'Canonical edit' },
  });
  await service.copy.update({ key: 'new', value: 'Submitted edit' });
  expect(
    service.getSnapshot().content!.copy.find((row) => row.id === 31)!.value,
  ).toBe('Canonical edit');
  repository.copy.remove.mockResolvedValue({ ok: true, value: undefined });
  await service.copy.remove('new');
  expect(service.getSnapshot().content!.copy).toHaveLength(1);
  const slot = home.images[0]!;
  const canonical = {
    ...slot,
    image: { ...slot.image, altText: 'Canonical alt' },
  };
  repository.image.mockResolvedValue({ ok: true, value: canonical });
  await service.image({ key: slot.key, image });
  expect(service.getSnapshot().content!.images[0]!.image.altText).toBe(
    'Canonical alt',
  );
  expect(repository.page).toHaveBeenCalledOnce();
});

it('rejects unloaded, overlapping, unavailable, and unsupported mutations before making requests', async () => {
  const { service, repository } = fixture();
  expect(await service.metadata({ title: 'Early' })).toMatchObject({
    ok: false,
  });
  expect(repository.metadata).not.toHaveBeenCalled();
  await service.load();
  expect(
    await service.trivia.create({ label: 'Hidden', value: 'Fact' }),
  ).toMatchObject({ ok: false });
  expect(await service.trivia.update(101, { value: 'Hidden' })).toMatchObject({
    ok: false,
  });
  expect(await service.entries.create(entry)).toMatchObject({ ok: false });
  expect(await service.entries.update(40, { title: 'Foreign' })).toMatchObject({
    ok: false,
  });
  expect(
    await service.eyebrows.update(999, { label: 'Missing' }),
  ).toMatchObject({ ok: false });
  expect(await service.eyebrows.remove(999)).toMatchObject({ ok: false });
  expect(
    await service.copy.update({ key: 'missing', value: 'Text' }),
  ).toMatchObject({ ok: false });
  expect(await service.copy.remove('missing')).toMatchObject({ ok: false });
  expect(await service.image({ key: 'missing', image })).toMatchObject({
    ok: false,
  });
  let finish!: () => void;
  repository.metadata.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ ok: true, value: home.page });
      }),
  );
  const pending = service.metadata({ title: 'First' });
  expect(service.getSnapshot().mutating).toBe(true);
  expect(await service.metadata({ title: 'Duplicate' })).toMatchObject({
    ok: false,
  });
  expect(repository.metadata).toHaveBeenCalledOnce();
  finish();
  await pending;
  expect(service.getSnapshot().mutating).toBe(false);
});

it('retains the cache and canonical failure on validation, forbidden, and rejected writes', async () => {
  const { service, repository, alerts, session } = fixture(voice);
  await service.load();
  const validation = {
    ok: false,
    error: { status: 400, detail: 'Invalid', fields: { title: ['Required'] } },
  } as const;
  repository.metadata.mockResolvedValueOnce(validation);
  expect(await service.metadata({ title: '' })).toBe(validation);
  expect(service.getSnapshot().content).toBe(voice);
  expect(alerts.show).not.toHaveBeenCalled();
  repository.metadata.mockRejectedValueOnce(new Error('Offline'));
  expect(await service.metadata({ title: 'Text' })).toMatchObject({
    ok: false,
    error: { status: null },
  });
  expect(alerts.show).toHaveBeenCalledOnce();
  repository.metadata.mockResolvedValueOnce({
    ok: false,
    error: { status: 403, detail: 'Forbidden', fields: {} },
  });
  await service.metadata({ title: 'Text' });
  expect(session.expire).toHaveBeenCalledExactlyOnceWith(
    '/cms/voiceover?role=40',
  );
  expect(service.getSnapshot()).toMatchObject({
    content: voice,
    mutating: false,
  });
});

it('rejects canonical replies that change ownership, identity, or a keyed address', async () => {
  const { service, repository } = fixture();
  await service.load();
  repository.eyebrows.create.mockResolvedValueOnce({
    ok: true,
    value: { ...home.eyebrows[0]!, pageId: 999 },
  });
  expect(await service.eyebrows.create({ label: 'Text' })).toMatchObject({
    ok: false,
  });
  repository.eyebrows.update.mockResolvedValueOnce({
    ok: true,
    value: { ...home.eyebrows[0]!, id: 999 },
  });
  expect(await service.eyebrows.update(100, { label: 'Text' })).toMatchObject({
    ok: false,
  });
  repository.copy.create.mockResolvedValueOnce({
    ok: true,
    value: home.copy[0]!,
  });
  expect(
    await service.copy.create({
      key: 'different',
      section: 'intro',
      kind: CopyKind.Body,
      value: 'Text',
    }),
  ).toMatchObject({ ok: false });
  repository.copy.update.mockResolvedValueOnce({
    ok: true,
    value: { ...home.copy[0]!, key: 'different' },
  });
  expect(
    await service.copy.update({ key: home.copy[0]!.key, value: 'Text' }),
  ).toMatchObject({ ok: false });
  repository.image.mockResolvedValueOnce({
    ok: true,
    value: { ...home.images[0]!, key: 'different' },
  });
  expect(
    await service.image({ key: home.images[0]!.key, image }),
  ).toMatchObject({ ok: false });
  expect(service.getSnapshot().content).toBe(home);
});

it('deleting an entry clears its hero and closes only a matching selected location', async () => {
  for (const [routePageId, selectedId, close] of [
    [2, 40, true],
    [2, 42, false],
    [3, 40, false],
  ] as const) {
    const data = toPageContent(
      aVoiceoverDTO({
        feature: { page_id: 2, item_id: 40 },
        roles: [anEntryDTO({ is_featured: true })],
      }),
    );
    const { service, repository, site } = fixture(data);
    // oxlint-disable-next-line no-await-in-loop -- Exercise each independent route context.
    await service.load();
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: { ...data.page, id: routePageId },
        editor: true,
        selectedId,
        anchor: '',
      },
    });
    repository.entries.remove.mockResolvedValue({ ok: true, value: undefined });
    // oxlint-disable-next-line no-await-in-loop -- Complete this context before checking the next.
    await service.entries.remove(40);
    expect(service.getSnapshot().content).toMatchObject({
      roles: [],
      feature: { pageId: 2, itemId: null },
    });
    expect(site.select).toHaveBeenCalledTimes(close ? 1 : 0);
  }
});
