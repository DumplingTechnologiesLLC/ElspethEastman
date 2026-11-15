import { expect, it, vi } from 'vitest';
import type { ContentRepository } from '../../domain/ports/ContentRepository';
import type { Http } from '../../domain/ports/Http';
import type { ContentResult } from '../../domain/models/ContentResult';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import { PageCollection } from '../../domain/models/PageCollection';
import { HttpContentRepository } from '../HttpContentRepository';
import {
  aBioDTO,
  aChapterDTO,
  aClipDTO,
  aCopyDTO,
  aCurrentItemDTO,
  aHomeDTO,
  aMediaAssetDTO,
  aMusicFeatureDTO,
  aPageDTO,
  aReleaseDTO,
  anAppearanceDTO,
  anEntryDTO,
} from '../../../../test/contentFixtures';

function fixture() {
  const request = vi.fn<Http['request']>();
  return {
    request,
    repository: new HttpContentRepository({
      request: request as Http['request'],
    }),
  };
}
const image = { assetId: 20, altText: 'Portrait', caption: 'In the studio' };
const imageDTO = {
  asset_id: 20,
  alt_text: 'Portrait',
  caption: 'In the studio',
};
const action = { label: 'Open', url: 'https://example.invalid/open' };

interface CollectionCase {
  name: string;
  path: string;
  dto: unknown;
  pageId: number;
  id: number;
  body: object;
  create: (repository: ContentRepository) => Promise<ContentResult<unknown>>;
  update: (repository: ContentRepository) => Promise<ContentResult<unknown>>;
  emptyUpdate: (
    repository: ContentRepository,
  ) => Promise<ContentResult<unknown>>;
  remove: (repository: ContentRepository) => Promise<ContentResult<void>>;
}
const eyebrow = { pageId: 2, label: 'Voice actor' };
const trivia = { pageId: 2, label: 'Since', value: '2012' };
const entry = {
  pageId: 2,
  title: 'Role',
  eyebrow: 'Game',
  description: 'Summary',
  image,
  action,
  category: null,
  publishedAt: null,
  metadata: [
    {
      key: 'details',
      label: 'Detail',
      value: 'Text',
      id: 41,
      entryId: 40,
      sortOrder: 0,
    },
  ],
  id: 40,
  isFeatured: true,
  sortOrder: 10,
};
const release = {
  pageId: 3,
  year: '2014',
  format: 'Album',
  title: 'Music',
  description: 'Songs',
  artwork: image,
  artworkTitle: 'Music',
  action,
};
const clip = {
  pageId: 4,
  eyebrow: 'Game',
  title: 'Clip',
  category: 'Highlights',
  action,
};
const appearance = {
  pageId: 5,
  year: '2026',
  title: 'Panel',
  format: 'Panel',
  url: null,
};
const chapter = {
  pageId: 6,
  eyebrow: 'Early years',
  heading: 'Beginning',
  body: 'Story',
};
const current = {
  pageId: 6,
  eyebrow: 'Music',
  title: 'Practice',
  description: 'Notes',
  link: action,
};

const cases: readonly CollectionCase[] = [
  {
    name: 'eyebrows',
    path: '/api/eyebrows/',
    pageId: 2,
    id: 100,
    dto: { id: 100, page_id: 2, label: 'Canonical label', sort_order: 0 },
    body: { label: 'Voice actor' },
    create: (r) => r.eyebrows.create(eyebrow),
    update: (r) => r.eyebrows.update(100, eyebrow),
    emptyUpdate: (r) => r.eyebrows.update(100, {}),
    remove: (r) => r.eyebrows.remove(100),
  },
  {
    name: 'trivia',
    path: '/api/trivia/',
    pageId: 2,
    id: 101,
    dto: { id: 101, page_id: 2, label: 'Since', value: '2012', sort_order: 0 },
    body: { label: 'Since', value: '2012' },
    create: (r) => r.trivia.create(trivia),
    update: (r) => r.trivia.update(101, trivia),
    emptyUpdate: (r) => r.trivia.update(101, {}),
    remove: (r) => r.trivia.remove(101),
  },
  {
    name: 'entries',
    path: '/api/content-entries/',
    pageId: 2,
    id: 40,
    dto: anEntryDTO(),
    body: {
      title: 'Role',
      eyebrow: 'Game',
      description: 'Summary',
      image: imageDTO,
      action,
      category: null,
      published_at: null,
      metadata: [{ key: 'details', label: 'Detail', value: 'Text' }],
    },
    create: (r) => r.entries.create(entry),
    update: (r) => r.entries.update(40, entry),
    emptyUpdate: (r) => r.entries.update(40, {}),
    remove: (r) => r.entries.remove(40),
  },
  {
    name: 'releases',
    path: '/api/music-releases/',
    pageId: 3,
    id: 50,
    dto: aReleaseDTO(),
    body: {
      year: '2014',
      format: 'Album',
      title: 'Music',
      description: 'Songs',
      artwork: imageDTO,
      artwork_title: 'Music',
      action,
    },
    create: (r) => r.releases.create(release),
    update: (r) => r.releases.update(50, release),
    emptyUpdate: (r) => r.releases.update(50, {}),
    remove: (r) => r.releases.remove(50),
  },
  {
    name: 'clips',
    path: '/api/stream-clips/',
    pageId: 4,
    id: 60,
    dto: aClipDTO(),
    body: { eyebrow: 'Game', title: 'Clip', category: 'Highlights', action },
    create: (r) => r.clips.create(clip),
    update: (r) => r.clips.update(60, clip),
    emptyUpdate: (r) => r.clips.update(60, {}),
    remove: (r) => r.clips.remove(60),
  },
  {
    name: 'appearances',
    path: '/api/appearances/',
    pageId: 5,
    id: 70,
    dto: anAppearanceDTO(),
    body: { year: '2026', title: 'Panel', format: 'Panel', url: null },
    create: (r) => r.appearances.create(appearance),
    update: (r) => r.appearances.update(70, appearance),
    emptyUpdate: (r) => r.appearances.update(70, {}),
    remove: (r) => r.appearances.remove(70),
  },
  {
    name: 'chapters',
    path: '/api/bio-chapters/',
    pageId: 6,
    id: 80,
    dto: aChapterDTO(),
    body: { eyebrow: 'Early years', heading: 'Beginning', body: 'Story' },
    create: (r) => r.chapters.create(chapter),
    update: (r) => r.chapters.update(80, chapter),
    emptyUpdate: (r) => r.chapters.update(80, {}),
    remove: (r) => r.chapters.remove(80),
  },
  {
    name: 'current items',
    path: '/api/current-items/',
    pageId: 6,
    id: 90,
    dto: aCurrentItemDTO(),
    body: {
      eyebrow: 'Music',
      title: 'Practice',
      description: 'Notes',
      link: action,
    },
    create: (r) => r.currentItems.create(current),
    update: (r) => r.currentItems.update(90, current),
    emptyUpdate: (r) => r.currentItems.update(90, {}),
    remove: (r) => r.currentItems.remove(90),
  },
];

it.each(cases)(
  'uses the $name collection contract and whitelists its write fields',
  async (testCase) => {
    const { request, repository } = fixture();
    request.mockResolvedValueOnce({ status: 201, data: testCase.dto });
    expect(await testCase.create(repository)).toMatchObject({
      ok: true,
      value: { id: testCase.id, pageId: testCase.pageId },
    });
    expect(request).toHaveBeenLastCalledWith(
      testCase.path,
      'POST',
      { page_id: testCase.pageId, ...testCase.body },
      true,
      'content',
    );
    request.mockResolvedValueOnce({ status: 200, data: testCase.dto });
    expect(await testCase.update(repository)).toMatchObject({
      ok: true,
      value: { id: testCase.id },
    });
    expect(request).toHaveBeenLastCalledWith(
      `${testCase.path}${testCase.id}/`,
      'PATCH',
      testCase.body,
      true,
      'content',
    );
    request.mockResolvedValueOnce({ status: 200, data: testCase.dto });
    await testCase.emptyUpdate(repository);
    expect(request).toHaveBeenLastCalledWith(
      `${testCase.path}${testCase.id}/`,
      'PATCH',
      {},
      true,
      'content',
    );
    request.mockResolvedValueOnce({ status: 204, data: null });
    expect(await testCase.remove(repository)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(request).toHaveBeenLastCalledWith(
      `${testCase.path}${testCase.id}/`,
      'DELETE',
      undefined,
      true,
      'content',
    );
  },
);

it('maps public registry and aggregate reads without attaching editor credentials', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValueOnce({
    status: 200,
    data: { pages: [aPageDTO('home'), aPageDTO('voiceover')] },
  });
  expect(await repository.site()).toMatchObject({
    ok: true,
    value: [
      { id: 1, kind: PageKind.Home },
      { id: 2, kind: PageKind.Voiceover },
    ],
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/site/',
    'GET',
    undefined,
    false,
    'content',
  );
  request.mockResolvedValueOnce({ status: 200, data: aBioDTO() });
  expect(await repository.page(6)).toMatchObject({
    ok: true,
    value: { kind: PageKind.Bio, currentItems: [{ id: 90 }] },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/pages/6/',
    'GET',
    undefined,
    false,
    'content',
  );
});

it('keeps metadata omission and explicit CTA clearing distinct', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValue({ status: 200, data: aPageDTO('voiceover') });
  await repository.metadata(2, {
    title: 'Characters',
    slug: 'characters',
    primaryAction: action,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/pages/2/',
    'PATCH',
    { title: 'Characters', slug: 'characters', primary_action: action },
    true,
    'content',
  );
  await repository.metadata(2, { primaryAction: null });
  expect(request).toHaveBeenLastCalledWith(
    '/api/pages/2/',
    'PATCH',
    { primary_action: null },
    true,
    'content',
  );
  await repository.metadata(2, {});
  expect(request).toHaveBeenLastCalledWith(
    '/api/pages/2/',
    'PATCH',
    {},
    true,
    'content',
  );
});

it('uses stable keyed copy/image addresses and encodes delete queries', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValue({ status: 200, data: aCopyDTO() });
  const input = {
    pageId: 1,
    key: 'intro',
    section: 'intro',
    kind: CopyKind.Body,
    value: 'Text',
    id: 30,
    sortOrder: 4,
  };
  await repository.copy.create(input);
  expect(request).toHaveBeenLastCalledWith(
    '/api/copy/',
    'POST',
    { page_id: 1, key: 'intro', section: 'intro', kind: 'body', value: 'Text' },
    true,
    'content',
  );
  await repository.copy.update(input);
  expect(request).toHaveBeenLastCalledWith(
    '/api/copy/',
    'PATCH',
    { page_id: 1, key: 'intro', kind: 'body', value: 'Text' },
    true,
    'content',
  );
  await repository.copy.update({ pageId: 1, key: 'intro' });
  expect(request).toHaveBeenLastCalledWith(
    '/api/copy/',
    'PATCH',
    { page_id: 1, key: 'intro' },
    true,
    'content',
  );
  request.mockResolvedValueOnce({ status: 204, data: null });
  expect(
    await repository.copy.remove({ pageId: 1, key: 'intro & more' }),
  ).toEqual({ ok: true, value: undefined });
  expect(request).toHaveBeenLastCalledWith(
    '/api/copy/?page_id=1&key=intro+%26+more',
    'DELETE',
    undefined,
    true,
    'content',
  );
  request.mockResolvedValueOnce({ status: 200, data: aHomeDTO().images[0] });
  await repository.image({ pageId: 1, key: 'hero', image });
  expect(request).toHaveBeenLastCalledWith(
    '/api/page-images/',
    'PATCH',
    { page_id: 1, key: 'hero', image: imageDTO },
    true,
    'content',
  );
});

it('retains explicit null values in entry and current-work updates', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValueOnce({
    status: 200,
    data: anEntryDTO({ image: null, action: null }),
  });
  await repository.entries.update(40, {
    image: null,
    action: null,
    metadata: [],
    category: 'Interview',
    publishedAt: '2026-10-01T14:30:00Z',
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/content-entries/40/',
    'PATCH',
    {
      image: null,
      action: null,
      metadata: [],
      category: 'Interview',
      published_at: '2026-10-01T14:30:00Z',
    },
    true,
    'content',
  );
  request.mockResolvedValueOnce({ status: 200, data: aCurrentItemDTO() });
  await repository.currentItems.update(90, { link: null });
  expect(request).toHaveBeenLastCalledWith(
    '/api/current-items/90/',
    'PATCH',
    { link: null },
    true,
    'content',
  );
});

it('uses the complete practice input and canonical reorder and feature responses', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValueOnce({ status: 200, data: aMusicFeatureDTO() });
  await repository.practice({
    pageId: 3,
    eyebrow: 'Practice',
    title: 'Cello',
    description: 'Notes',
    image,
    facts: [{ label: 'Focus', value: 'Bowing' }],
    action,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/music-features/',
    'PATCH',
    {
      page_id: 3,
      eyebrow: 'Practice',
      title: 'Cello',
      description: 'Notes',
      image: imageDTO,
      facts: [{ label: 'Focus', value: 'Bowing' }],
      action,
    },
    true,
    'content',
  );
  request.mockResolvedValueOnce({
    status: 200,
    data: {
      page_id: 2,
      collection: 'content_entries',
      section: null,
      ordered_ids: [41, 40],
    },
  });
  expect(
    await repository.reorder({
      pageId: 2,
      collection: PageCollection.ContentEntries,
      section: null,
      orderedIds: [41, 40],
    }),
  ).toEqual({
    ok: true,
    value: {
      pageId: 2,
      collection: PageCollection.ContentEntries,
      section: null,
      orderedIds: [41, 40],
    },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/collections/reorder/',
    'PATCH',
    {
      page_id: 2,
      collection: 'content_entries',
      section: null,
      ordered_ids: [41, 40],
    },
    true,
    'content',
  );
  request.mockResolvedValueOnce({
    status: 200,
    data: { page_id: 2, item_id: null },
  });
  expect(await repository.feature({ pageId: 2, itemId: null })).toEqual({
    ok: true,
    value: { pageId: 2, itemId: null },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/featured-items/',
    'PATCH',
    { page_id: 2, item_id: null },
    true,
    'content',
  );
});

it('sends uploaded binaries as multipart data and returns the verified asset', async () => {
  const { request, repository } = fixture();
  const file = new File(['image'], 'portrait.png', { type: 'image/png' });
  request.mockResolvedValueOnce({ status: 201, data: aMediaAssetDTO() });
  expect(
    await repository.upload({
      file,
      credit: 'Photographer',
      sourceUrl: 'https://example.invalid/source',
    }),
  ).toMatchObject({ ok: true, value: { id: 20, mimeType: 'image/png' } });
  const body = request.mock.lastCall![2];
  expect(body).toBeInstanceOf(FormData);
  if (!(body instanceof FormData)) throw new Error('Expected multipart data');
  expect(body.get('file')).toBeInstanceOf(File);
  expect(body.get('credit')).toBe('Photographer');
  expect(body.get('source_url')).toBe('https://example.invalid/source');
  expect(request).toHaveBeenLastCalledWith(
    '/api/media-assets/',
    'POST',
    body,
    true,
    'content',
  );
});

it.each([null, 100, 304, 400, 403, 404, 500])(
  'preserves unsuccessful transport status %s',
  async (status) => {
    const { request, repository } = fixture();
    request.mockResolvedValue({
      status,
      data: {
        detail: 'Request failed',
        fields: { 'image.alt_text': ['Required'] },
      },
    });
    expect(await repository.page(1)).toEqual({
      ok: false,
      error: {
        status,
        detail: 'Request failed',
        fields: { 'image.altText': ['Required'] },
      },
    });
  },
);

it('normalizes rejected transport and unreadable success bodies without losing an HTTP status', async () => {
  const { request, repository } = fixture();
  request.mockRejectedValueOnce(new TypeError('Offline'));
  expect(await repository.site()).toMatchObject({
    ok: false,
    error: { status: null },
  });
  request.mockResolvedValueOnce({ status: 200, data: null });
  expect(await repository.site()).toMatchObject({
    ok: false,
    error: { status: 200 },
  });
  request.mockResolvedValueOnce({ status: 200, data: { pages: null } });
  expect(await repository.site()).toMatchObject({
    ok: false,
    error: { status: 200, detail: expect.stringContaining('could not read') },
  });
  request.mockResolvedValueOnce({ status: 403, data: { detail: 'Forbidden' } });
  expect(await repository.eyebrows.remove(100)).toEqual({
    ok: false,
    error: { status: 403, detail: 'Forbidden', fields: {} },
  });
});
