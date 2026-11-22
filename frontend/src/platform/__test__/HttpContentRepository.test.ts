import {
  cases,
  action,
  image,
  imageDTO,
} from '../../../../test/contentWriteCases';
import { expect, it, vi } from 'vitest';
import type { Http } from '../../domain/ports/Http';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import { PageCollection } from '../../domain/models/PageCollection';
import { HttpContentRepository } from '../HttpContentRepository';
import {
  aBioDTO,
  aCopyDTO,
  aCurrentItemDTO,
  aHomeDTO,
  aMediaAssetDTO,
  aMusicFeatureDTO,
  aPageDTO,
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
      { id: '00000000-0000-4000-8000-000000000001', kind: PageKind.Home },
      { id: '00000000-0000-4000-8000-000000000002', kind: PageKind.Voiceover },
    ],
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/site/',
    'GET',
    undefined,
    false,
    'content',
  );
  request.mockResolvedValueOnce({ status: 200, data: aBioDTO() });
  expect(
    await repository.page('00000000-0000-4000-8000-000000000006'),
  ).toMatchObject({
    ok: true,
    value: {
      kind: PageKind.Bio,
      currentItems: [{ id: '00000000-0000-4000-8000-00000000005a' }],
    },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/00000000-0000-4000-8000-000000000006/',
    'GET',
    undefined,
    false,
    'content',
  );
});

it('keeps metadata omission and explicit CTA clearing distinct', async () => {
  const { request, repository } = fixture();
  request.mockResolvedValue({ status: 200, data: aPageDTO('voiceover') });
  await repository.metadata('00000000-0000-4000-8000-000000000002', {
    title: 'Characters',
    slug: 'characters',
    primaryAction: action,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/00000000-0000-4000-8000-000000000002/',
    'PATCH',
    { title: 'Characters', slug: 'characters', primary_action: action },
    true,
    'content',
  );
  await repository.metadata('00000000-0000-4000-8000-000000000002', {
    primaryAction: null,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/00000000-0000-4000-8000-000000000002/',
    'PATCH',
    { primary_action: null },
    true,
    'content',
  );
  await repository.metadata('00000000-0000-4000-8000-000000000002', {});
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/00000000-0000-4000-8000-000000000002/',
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
    pageId: '00000000-0000-4000-8000-000000000001',
    key: 'intro',
    section: 'intro',
    kind: CopyKind.Body,
    value: 'Text',
    id: '00000000-0000-4000-8000-00000000001e',
    sortOrder: 4,
  };
  await repository.copy.create(input);
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/copy/',
    'POST',
    {
      page_id: '00000000-0000-4000-8000-000000000001',
      key: 'intro',
      section: 'intro',
      kind: 'body',
      value: 'Text',
    },
    true,
    'content',
  );
  await repository.copy.update(input);
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/copy/',
    'PATCH',
    {
      page_id: '00000000-0000-4000-8000-000000000001',
      key: 'intro',
      kind: 'body',
      value: 'Text',
    },
    true,
    'content',
  );
  await repository.copy.update({
    pageId: '00000000-0000-4000-8000-000000000001',
    key: 'intro',
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/copy/',
    'PATCH',
    { page_id: '00000000-0000-4000-8000-000000000001', key: 'intro' },
    true,
    'content',
  );
  request.mockResolvedValueOnce({ status: 204, data: null });
  expect(
    await repository.copy.remove({
      pageId: '00000000-0000-4000-8000-000000000001',
      key: 'intro & more',
    }),
  ).toEqual({ ok: true, value: undefined });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/copy/?page_id=00000000-0000-4000-8000-000000000001&key=intro+%26+more',
    'DELETE',
    undefined,
    true,
    'content',
  );
  request.mockResolvedValueOnce({ status: 200, data: aHomeDTO().images[0] });
  await repository.image({
    pageId: '00000000-0000-4000-8000-000000000001',
    key: 'hero',
    image,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/pages/images/',
    'PATCH',
    {
      page_id: '00000000-0000-4000-8000-000000000001',
      key: 'hero',
      image: imageDTO,
    },
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
  await repository.entries.update('00000000-0000-4000-8000-000000000028', {
    image: null,
    action: null,
    metadata: [],
    category: 'Interview',
    publishedAt: '2026-10-01T14:30:00Z',
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/content/entries/00000000-0000-4000-8000-000000000028/',
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
  await repository.currentItems.update('00000000-0000-4000-8000-00000000005a', {
    link: null,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/bio/current/00000000-0000-4000-8000-00000000005a/',
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
    pageId: '00000000-0000-4000-8000-000000000003',
    eyebrow: 'Practice',
    title: 'Cello',
    description: 'Notes',
    image,
    facts: [{ label: 'Focus', value: 'Bowing' }],
    action,
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/music/features/',
    'PATCH',
    {
      page_id: '00000000-0000-4000-8000-000000000003',
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
      page_id: '00000000-0000-4000-8000-000000000002',
      collection: 'content_entries',
      section: null,
      ordered_ids: [
        '00000000-0000-4000-8000-000000000029',
        '00000000-0000-4000-8000-000000000028',
      ],
    },
  });
  expect(
    await repository.reorder({
      pageId: '00000000-0000-4000-8000-000000000002',
      collection: PageCollection.ContentEntries,
      section: null,
      orderedIds: [
        '00000000-0000-4000-8000-000000000029',
        '00000000-0000-4000-8000-000000000028',
      ],
    }),
  ).toEqual({
    ok: true,
    value: {
      pageId: '00000000-0000-4000-8000-000000000002',
      collection: PageCollection.ContentEntries,
      section: null,
      orderedIds: [
        '00000000-0000-4000-8000-000000000029',
        '00000000-0000-4000-8000-000000000028',
      ],
    },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/collections/reorder/',
    'PATCH',
    {
      page_id: '00000000-0000-4000-8000-000000000002',
      collection: 'content_entries',
      section: null,
      ordered_ids: [
        '00000000-0000-4000-8000-000000000029',
        '00000000-0000-4000-8000-000000000028',
      ],
    },
    true,
    'content',
  );
  request.mockResolvedValueOnce({
    status: 200,
    data: { page_id: '00000000-0000-4000-8000-000000000002', item_id: null },
  });
  expect(
    await repository.feature({
      pageId: '00000000-0000-4000-8000-000000000002',
      itemId: null,
    }),
  ).toEqual({
    ok: true,
    value: { pageId: '00000000-0000-4000-8000-000000000002', itemId: null },
  });
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/content/features/',
    'PATCH',
    { page_id: '00000000-0000-4000-8000-000000000002', item_id: null },
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
  ).toMatchObject({
    ok: true,
    value: {
      id: '00000000-0000-4000-8000-000000000014',
      mimeType: 'image/png',
    },
  });
  const body = request.mock.lastCall![2];
  expect(body).toBeInstanceOf(FormData);
  if (!(body instanceof FormData)) throw new Error('Expected multipart data');
  expect(body.get('file')).toBeInstanceOf(File);
  expect(body.get('credit')).toBe('Photographer');
  expect(body.get('source_url')).toBe('https://example.invalid/source');
  expect(request).toHaveBeenLastCalledWith(
    '/api/v2/media/assets/',
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
    expect(
      await repository.page('00000000-0000-4000-8000-000000000001'),
    ).toEqual({
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
  expect(
    await repository.eyebrows.remove('00000000-0000-4000-8000-000000000064'),
  ).toEqual({
    ok: false,
    error: { status: 403, detail: 'Forbidden', fields: {} },
  });
});
