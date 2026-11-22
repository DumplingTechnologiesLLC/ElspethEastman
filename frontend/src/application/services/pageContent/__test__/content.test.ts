import { expect, it } from 'vitest';
import {
  aBioDTO,
  aCopyDTO,
  aHomeDTO,
  aMusicDTO,
  aPressDTO,
  aStreamingDTO,
  aVoiceoverDTO,
  anEntryDTO,
} from '../../../../../../test/contentFixtures';
import { toPageContent } from '../../../mappers/contentAggregate';
import { toPageCopy } from '../../../mappers/contentShared';
import { PageKind } from '../../../../domain/models/Page';
import { PageCollection } from '../../../../domain/models/PageCollection';
import type { CollectionOrder } from '../../../../domain/models/PageCollection';
import {
  appearancePolicy,
  chapterPolicy,
  clipPolicy,
  currentPolicy,
  entryPolicy,
  eyebrowPolicy,
  releasePolicy,
  triviaPolicy,
} from '../collections';
import { withFeaturedItem, withoutEntry, withPractice } from '../featured';
import { orderCollection, withCollectionOrder } from '../order';
import {
  upsertRecord,
  withCopy,
  withoutCopy,
  withMetadata,
  withPageImage,
} from '../shared';

const home = toPageContent(aHomeDTO());
const voice = toPageContent(
  aVoiceoverDTO({
    roles: [
      anEntryDTO({ sort_order: 3 }),
      anEntryDTO({
        id: '00000000-0000-4000-8000-00000000002a',
        title: 'Cadence',
        sort_order: 4,
      }),
    ],
  }),
);
const music = toPageContent(aMusicDTO());
const stream = toPageContent(aStreamingDTO());
const press = toPageContent(aPressDTO());
const bio = toPageContent(aBioDTO());

it('preserves canonical membership order for opaque identity ties and keeps old snapshots', () => {
  const first = 'ffffffff-ffff-4fff-8fff-fffffffffff1';
  const second = '00000000-0000-4000-8000-000000000001';
  const third = '00000000-0000-4000-8000-000000000003';
  const pageId = '00000000-0000-4000-8000-000000000001';
  const rows = [
    { id: first, pageId, sortOrder: 0, label: 'First' },
    { id: second, pageId, sortOrder: 0, label: 'Second' },
  ];
  const updated = upsertRecord(rows, { ...rows[0]!, label: 'Canonical' });
  expect(updated.map((row) => [row.id, row.label])).toEqual([
    [first, 'Canonical'],
    [second, 'Second'],
  ]);
  const added = upsertRecord(updated, {
    id: third,
    pageId,
    sortOrder: 0,
    label: 'Third',
  });
  expect(added.map((row) => row.id)).toEqual([first, second, third]);
  expect(
    upsertRecord(added, { ...added[0]!, sortOrder: 2 }).map((row) => row.id),
  ).toEqual([second, third, first]);
  expect(rows[0]!.label).toBe('First');
});

it('updates metadata and keyed content within the existing page identity', () => {
  const metadata = withMetadata(home, { ...home.page, title: 'Welcome' });
  expect(metadata.page.title).toBe('Welcome');
  expect(home.page.title).toBe('home');
  expect(
    withMetadata(home, {
      ...home.page,
      id: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(home);
  expect(withMetadata(home, { ...home.page, kind: PageKind.Bio })).toBe(home);
  const block = { ...home.copy[0]!, value: 'Canonical text' };
  expect(withCopy(home, block).copy[0]!.value).toBe('Canonical text');
  expect(
    withCopy(home, {
      ...block,
      pageId: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(home);
  expect(withoutCopy(home, block.key).copy).toEqual([]);
  expect(withoutCopy(home, 'missing')).toBe(home);
  const image = {
    ...home.images[0]!,
    image: { ...home.images[0]!.image, altText: 'Canonical alt text' },
  };
  expect(withPageImage(home, image).images[0]!.image.altText).toBe(
    'Canonical alt text',
  );
  expect(
    withPageImage(home, {
      ...image,
      pageId: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(home);
  expect(withPageImage(home, { ...image, key: 'unseeded-slot' })).toBe(home);
  const multiple = {
    ...home,
    images: [...home.images, { ...image, key: 'other' }],
  };
  expect(withPageImage(multiple, image).images[1]).toBe(multiple.images[1]);
});

it('keeps the shared identity and fact collections independent', () => {
  expect(eyebrowPolicy.rows(home)).toBe(home.eyebrows);
  expect(triviaPolicy.rows(voice)).toBe(voice.trivia);
  const labels = [{ ...home.eyebrows[0]!, label: 'Updated' }];
  expect(eyebrowPolicy.replace(home, labels).eyebrows).toBe(labels);
  expect(triviaPolicy.replace(voice, []).trivia).toEqual([]);
});

it('replaces entry collections only on their owning page kinds', () => {
  for (const page of [voice, stream, press]) {
    expect(entryPolicy.rows(page)).toHaveLength(
      page.kind === PageKind.Voiceover ? 2 : 1,
    );
    const updated = entryPolicy.replace(page, []);
    expect(entryPolicy.rows(updated)).toEqual([]);
  }
  expect(entryPolicy.rows(home)).toBeNull();
  expect(entryPolicy.replace(home, [])).toBe(home);
});

it('retains separate release, clip, appearance, chapter, and current-work owners', () => {
  expect(releasePolicy.rows(music)).toHaveLength(1);
  expect(clipPolicy.rows(stream)).toHaveLength(1);
  expect(appearancePolicy.rows(press)).toHaveLength(1);
  expect(chapterPolicy.rows(bio)).toHaveLength(1);
  expect(currentPolicy.rows(bio)).toHaveLength(1);
  expect(releasePolicy.rows(releasePolicy.replace(music, []))).toEqual([]);
  expect(clipPolicy.rows(clipPolicy.replace(stream, []))).toEqual([]);
  expect(appearancePolicy.rows(appearancePolicy.replace(press, []))).toEqual(
    [],
  );
  expect(chapterPolicy.rows(chapterPolicy.replace(bio, []))).toEqual([]);
  expect(currentPolicy.rows(currentPolicy.replace(bio, []))).toEqual([]);
  for (const policy of [
    releasePolicy,
    clipPolicy,
    appearancePolicy,
    chapterPolicy,
    currentPolicy,
  ]) {
    expect(policy.rows(home)).toBeNull();
    expect(policy.replace(home, [])).toBe(home);
  }
});

it('promotes and demotes the same canonical records without changing positions', () => {
  const featured = withFeaturedItem(voice, {
    pageId: '00000000-0000-4000-8000-000000000002',
    itemId: '00000000-0000-4000-8000-00000000002a',
  });
  if (featured.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(featured.feature.itemId).toBe('00000000-0000-4000-8000-00000000002a');
  expect(
    featured.roles.map((row) => [row.id, row.sortOrder, row.isFeatured]),
  ).toEqual([
    ['00000000-0000-4000-8000-000000000028', 3, false],
    ['00000000-0000-4000-8000-00000000002a', 4, true],
  ]);
  const demoted = withFeaturedItem(featured, {
    pageId: '00000000-0000-4000-8000-000000000002',
    itemId: null,
  });
  if (demoted.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(demoted.roles.every((row) => !row.isFeatured)).toBe(true);
  expect(voice.kind === PageKind.Voiceover && voice.roles[1]!.isFeatured).toBe(
    false,
  );
  expect(
    withFeaturedItem(home, {
      pageId: '00000000-0000-4000-8000-000000000001',
      itemId: null,
    }),
  ).toBe(home);
  expect(
    withFeaturedItem(voice, {
      pageId: '00000000-0000-4000-8000-0000000003e7',
      itemId: '00000000-0000-4000-8000-000000000028',
    }),
  ).toBe(voice);
  expect(
    withFeaturedItem(voice, {
      pageId: '00000000-0000-4000-8000-000000000002',
      itemId: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(voice);
  const imageless = toPageContent(
    aStreamingDTO({
      entries: [
        anEntryDTO({
          page_id: '00000000-0000-4000-8000-000000000004',
          image: null,
        }),
      ],
    }),
  );
  expect(
    withFeaturedItem(imageless, {
      pageId: '00000000-0000-4000-8000-000000000004',
      itemId: '00000000-0000-4000-8000-000000000028',
    }),
  ).toBe(imageless);
  for (const page of [stream, press])
    expect(
      withFeaturedItem(page, {
        pageId: page.page.id,
        itemId: '00000000-0000-4000-8000-000000000028',
      }),
    ).not.toBe(page);
});

it('clears a deleted hero while preserving other selections and keeps practice separate', () => {
  for (const page of [voice, stream, press]) {
    const featured = withFeaturedItem(page, {
      pageId: page.page.id,
      itemId: '00000000-0000-4000-8000-000000000028',
    });
    const removed = withoutEntry(
      featured,
      '00000000-0000-4000-8000-000000000028',
    );
    if (
      removed.kind === PageKind.Home ||
      removed.kind === PageKind.Music ||
      removed.kind === PageKind.Bio
    )
      throw new Error('Wrong fixture');
    expect(removed.feature.itemId).toBeNull();
    expect(
      entryPolicy
        .rows(removed)!
        .some((row) => row.id === '00000000-0000-4000-8000-000000000028'),
    ).toBe(false);
  }
  const featured = withFeaturedItem(voice, {
    pageId: '00000000-0000-4000-8000-000000000002',
    itemId: '00000000-0000-4000-8000-000000000028',
  });
  const otherRemoved = withoutEntry(
    featured,
    '00000000-0000-4000-8000-00000000002a',
  );
  if (otherRemoved.kind !== PageKind.Voiceover)
    throw new Error('Wrong fixture');
  expect(otherRemoved.feature.itemId).toBe(
    '00000000-0000-4000-8000-000000000028',
  );
  expect(withoutEntry(home, '00000000-0000-4000-8000-000000000028')).toBe(home);
  expect(withoutEntry(voice, '00000000-0000-4000-8000-0000000003e7')).toBe(
    voice,
  );
  if (music.kind !== PageKind.Music) throw new Error('Wrong fixture');
  const practice = { ...music.feature, title: 'New practice' };
  expect(withPractice(music, practice)).toMatchObject({
    feature: { title: 'New practice' },
  });
  expect(withPractice(home, practice)).toBe(home);
  expect(
    withPractice(music, {
      ...practice,
      pageId: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(music);
});

it('applies full canonical order across each owned collection', () => {
  for (const [content, collection, id] of [
    [voice, PageCollection.Eyebrows, '00000000-0000-4000-8000-000000000064'],
    [voice, PageCollection.Trivia, '00000000-0000-4000-8000-000000000065'],
    [music, PageCollection.Releases, '00000000-0000-4000-8000-000000000032'],
    [
      stream,
      PageCollection.StreamClips,
      '00000000-0000-4000-8000-00000000003c',
    ],
    [press, PageCollection.Appearances, '00000000-0000-4000-8000-000000000046'],
    [bio, PageCollection.BioChapters, '00000000-0000-4000-8000-000000000050'],
    [bio, PageCollection.CurrentItems, '00000000-0000-4000-8000-00000000005a'],
  ] as const) {
    expect(
      withCollectionOrder(content, {
        pageId: content.page.id,
        collection,
        section: null,
        orderedIds: [id],
      }),
    ).not.toBe(content);
  }
  const featured = withFeaturedItem(voice, {
    pageId: '00000000-0000-4000-8000-000000000002',
    itemId: '00000000-0000-4000-8000-000000000028',
  });
  const ordered = withCollectionOrder(featured, {
    pageId: '00000000-0000-4000-8000-000000000002',
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [
      '00000000-0000-4000-8000-00000000002a',
      '00000000-0000-4000-8000-000000000028',
    ],
  });
  expect(
    entryPolicy.rows(ordered)!.map((row) => [row.id, row.sortOrder]),
  ).toEqual([
    ['00000000-0000-4000-8000-00000000002a', 0],
    ['00000000-0000-4000-8000-000000000028', 1],
  ]);
  if (ordered.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(ordered.feature.itemId).toBe('00000000-0000-4000-8000-000000000028');
});

it('rejects partial, duplicate, foreign, unsupported, or incorrectly scoped orders without changing content', () => {
  const order: CollectionOrder = {
    pageId: '00000000-0000-4000-8000-000000000002',
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [
      '00000000-0000-4000-8000-00000000002a',
      '00000000-0000-4000-8000-000000000028',
    ],
  };
  for (const input of [
    { ...order, orderedIds: ['00000000-0000-4000-8000-000000000028'] },
    {
      ...order,
      orderedIds: [
        '00000000-0000-4000-8000-000000000028',
        '00000000-0000-4000-8000-000000000028',
      ],
    },
    {
      ...order,
      orderedIds: [
        '00000000-0000-4000-8000-000000000028',
        '00000000-0000-4000-8000-0000000003e7',
      ],
    },
    { ...order, pageId: '00000000-0000-4000-8000-0000000003e7' },
    { ...order, section: 'intro' },
    { ...order, collection: PageCollection.Releases },
    { ...order, collection: '__proto__' as PageCollection },
  ])
    expect(withCollectionOrder(voice, input)).toBe(voice);
  expect(
    orderCollection(releasePolicy, voice, {
      ...order,
      collection: PageCollection.Releases,
    }),
  ).toBe(voice);
  expect(
    orderCollection(entryPolicy, voice, {
      ...order,
      pageId: '00000000-0000-4000-8000-0000000003e7',
    }),
  ).toBe(voice);
  expect(
    orderCollection(entryPolicy, voice, {
      ...order,
      collection: PageCollection.Releases,
    }),
  ).toBe(voice);
});

it('orders copy only within its section and leaves unrelated positions intact', () => {
  const content = toPageContent(
    aVoiceoverDTO({
      copy: [
        aCopyDTO({ page_id: '00000000-0000-4000-8000-000000000002' }),
        aCopyDTO({
          id: '00000000-0000-4000-8000-00000000001f',
          page_id: '00000000-0000-4000-8000-000000000002',
          key: 'second',
          sort_order: 1,
        }),
        aCopyDTO({
          id: '00000000-0000-4000-8000-000000000020',
          page_id: '00000000-0000-4000-8000-000000000002',
          key: 'roles-title',
          section: 'roles',
          kind: 'section_label',
          sort_order: 7,
        }),
      ],
    }),
  );
  const input: CollectionOrder = {
    pageId: '00000000-0000-4000-8000-000000000002',
    collection: PageCollection.Copy,
    section: 'intro',
    orderedIds: [
      '00000000-0000-4000-8000-00000000001f',
      '00000000-0000-4000-8000-00000000001e',
    ],
  };
  const result = withCollectionOrder(content, input);
  expect(
    result.copy
      .filter((row) => row.section === 'intro')
      .map((row) => [row.id, row.sortOrder]),
  ).toEqual([
    ['00000000-0000-4000-8000-00000000001f', 0],
    ['00000000-0000-4000-8000-00000000001e', 1],
  ]);
  expect(result.copy.find((row) => row.section === 'roles')!.sortOrder).toBe(7);
  for (const invalid of [
    { ...input, section: null },
    { ...input, section: 'unknown' },
    { ...input, orderedIds: ['00000000-0000-4000-8000-00000000001e'] },
  ])
    expect(withCollectionOrder(content, invalid)).toBe(content);
  expect(
    withCollectionOrder(home, {
      pageId: '00000000-0000-4000-8000-000000000001',
      collection: PageCollection.Copy,
      section: 'intro',
      orderedIds: ['00000000-0000-4000-8000-00000000001e'],
    }),
  ).not.toBe(home);
  const empty = { ...home, copy: [] };
  expect(
    withCollectionOrder(empty, {
      pageId: '00000000-0000-4000-8000-000000000001',
      collection: PageCollection.Copy,
      section: 'intro',
      orderedIds: [],
    }),
  ).toMatchObject({ copy: [] });
  expect(
    withCopy(
      home,
      toPageCopy(
        aCopyDTO({ id: '00000000-0000-4000-8000-00000000001f', key: 'new' }),
      ),
    ).copy,
  ).toHaveLength(2);
});
