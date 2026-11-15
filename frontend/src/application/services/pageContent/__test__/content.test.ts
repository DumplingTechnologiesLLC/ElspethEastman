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
import {
  withEntry,
  withFeaturedItem,
  withoutEntry,
  withPractice,
} from '../featured';
import { collectionIds, orderCollection, withCollectionOrder } from '../order';
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
      anEntryDTO({ id: 42, title: 'Cadence', sort_order: 4 }),
    ],
  }),
);
const music = toPageContent(aMusicDTO());
const stream = toPageContent(aStreamingDTO());
const press = toPageContent(aPressDTO());
const bio = toPageContent(aBioDTO());
it('reads complete reorder membership only for supported collections and copy sections', () => {
  for (const [content, collection, expected] of [
    [voice, PageCollection.Eyebrows, [100]],
    [voice, PageCollection.Trivia, [101]],
    [voice, PageCollection.ContentEntries, [40, 42]],
    [music, PageCollection.Releases, [50]],
    [stream, PageCollection.StreamClips, [60]],
    [press, PageCollection.Appearances, [70]],
    [bio, PageCollection.BioChapters, [80]],
    [bio, PageCollection.CurrentItems, [90]],
  ] as const)
    expect(collectionIds(content, { collection, section: null })).toEqual(
      expected,
    );
  expect(
    collectionIds(home, { collection: PageCollection.Trivia, section: null }),
  ).toBeNull();
  expect(
    collectionIds(home, { collection: PageCollection.Copy, section: null }),
  ).toBeNull();
  expect(
    collectionIds(home, {
      collection: PageCollection.Copy,
      section: 'missing',
    }),
  ).toBeNull();
  expect(
    collectionIds(home, { collection: PageCollection.Copy, section: 'intro' }),
  ).toEqual([30]);
  expect(
    collectionIds(home, { collection: PageCollection.Copy, section: 'intro' }),
  ).toEqual(
    home.copy.filter((row) => row.section === 'intro').map((row) => row.id),
  );
  expect(
    collectionIds(voice, {
      collection: PageCollection.Eyebrows,
      section: 'intro',
    }),
  ).toBeNull();
  const otherCopy = {
    ...home,
    copy: [...home.copy, { ...home.copy[0]!, id: 32, section: 'other' }],
  };
  expect(
    collectionIds(otherCopy, {
      collection: PageCollection.Copy,
      section: 'intro',
    }),
  ).toEqual([30]);
});

it('reconciles an edited entry with its canonical hero flag and rejects invalid ownership', () => {
  const row = entryPolicy.rows(voice)![0]!;
  expect(withEntry(home, row)).toBe(home);
  expect(withEntry(voice, { ...row, pageId: 999 })).toBe(voice);
  expect(withEntry(voice, { ...row, isFeatured: true, image: null })).toBe(
    voice,
  );
  for (const page of [voice, stream, press]) {
    const original = entryPolicy.rows(page)![0]!;
    const featured = withEntry(page, {
      ...original,
      title: 'Canonical hero',
      isFeatured: true,
    });
    expect(featured).toMatchObject({ feature: { itemId: original.id } });
    const demoted = withEntry(featured, { ...original, isFeatured: false });
    expect(demoted).toMatchObject({ feature: { itemId: null } });
  }
  const featured = withFeaturedItem(voice, { pageId: 2, itemId: row.id });
  const other = entryPolicy.rows(voice)![1]!;
  expect(withEntry(featured, { ...other, title: 'Other edit' })).toMatchObject({
    feature: { itemId: row.id },
  });
});

it('keeps existing copy keys and sections immutable and rejects duplicate keyed identities', () => {
  const block = home.copy[0]!;
  expect(withCopy(home, { ...block, key: 'moved' })).toBe(home);
  expect(withCopy(home, { ...block, section: 'moved' })).toBe(home);
  expect(withCopy(home, { ...block, id: 999 })).toBe(home);
});

it('upserts canonical records by identity, uses manual order with an ID tie-break, and preserves old snapshots', () => {
  const rows = [
    { id: 2, pageId: 1, sortOrder: 0, label: 'Two' },
    { id: 1, pageId: 1, sortOrder: 0, label: 'One' },
  ];
  const updated = upsertRecord(rows, {
    id: 1,
    pageId: 1,
    sortOrder: 0,
    label: 'Canonical',
  });
  expect(updated.map((row) => [row.id, row.label])).toEqual([
    [1, 'Canonical'],
    [2, 'Two'],
  ]);
  expect(
    upsertRecord(updated, {
      id: 3,
      pageId: 1,
      sortOrder: 2,
      label: 'Three',
    }).map((row) => row.id),
  ).toEqual([1, 2, 3]);
  expect(rows[1]!.label).toBe('One');
});

it('updates metadata and keyed content within the existing page identity', () => {
  const metadata = withMetadata(home, { ...home.page, title: 'Welcome' });
  expect(metadata.page.title).toBe('Welcome');
  expect(home.page.title).toBe('home');
  expect(withMetadata(home, { ...home.page, id: 999 })).toBe(home);
  expect(withMetadata(home, { ...home.page, kind: PageKind.Bio })).toBe(home);
  const block = { ...home.copy[0]!, value: 'Canonical text' };
  expect(withCopy(home, block).copy[0]!.value).toBe('Canonical text');
  expect(withCopy(home, { ...block, pageId: 999 })).toBe(home);
  expect(withoutCopy(home, block.key).copy).toEqual([]);
  expect(withoutCopy(home, 'missing')).toBe(home);
  const image = {
    ...home.images[0]!,
    image: { ...home.images[0]!.image, altText: 'Canonical alt text' },
  };
  expect(withPageImage(home, image).images[0]!.image.altText).toBe(
    'Canonical alt text',
  );
  expect(withPageImage(home, { ...image, pageId: 999 })).toBe(home);
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
  const featured = withFeaturedItem(voice, { pageId: 2, itemId: 42 });
  if (featured.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(featured.feature.itemId).toBe(42);
  expect(
    featured.roles.map((row) => [row.id, row.sortOrder, row.isFeatured]),
  ).toEqual([
    [40, 3, false],
    [42, 4, true],
  ]);
  const demoted = withFeaturedItem(featured, { pageId: 2, itemId: null });
  if (demoted.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(demoted.roles.every((row) => !row.isFeatured)).toBe(true);
  expect(voice.kind === PageKind.Voiceover && voice.roles[1]!.isFeatured).toBe(
    false,
  );
  expect(withFeaturedItem(home, { pageId: 1, itemId: null })).toBe(home);
  expect(withFeaturedItem(voice, { pageId: 999, itemId: 40 })).toBe(voice);
  expect(withFeaturedItem(voice, { pageId: 2, itemId: 999 })).toBe(voice);
  const imageless = toPageContent(
    aStreamingDTO({
      feature: { page_id: 4, item_id: null },
      entries: [anEntryDTO({ page_id: 4, image: null })],
    }),
  );
  expect(withFeaturedItem(imageless, { pageId: 4, itemId: 40 })).toBe(
    imageless,
  );
  for (const page of [stream, press])
    expect(
      withFeaturedItem(page, { pageId: page.page.id, itemId: 40 }),
    ).not.toBe(page);
});

it('clears a deleted hero while preserving other selections and keeps practice separate', () => {
  for (const page of [voice, stream, press]) {
    const featured = withFeaturedItem(page, {
      pageId: page.page.id,
      itemId: 40,
    });
    const removed = withoutEntry(featured, 40);
    if (
      removed.kind === PageKind.Home ||
      removed.kind === PageKind.Music ||
      removed.kind === PageKind.Bio
    )
      throw new Error('Wrong fixture');
    expect(removed.feature.itemId).toBeNull();
    expect(entryPolicy.rows(removed)!.some((row) => row.id === 40)).toBe(false);
  }
  const featured = withFeaturedItem(voice, { pageId: 2, itemId: 40 });
  const otherRemoved = withoutEntry(featured, 42);
  if (otherRemoved.kind !== PageKind.Voiceover)
    throw new Error('Wrong fixture');
  expect(otherRemoved.feature.itemId).toBe(40);
  expect(withoutEntry(home, 40)).toBe(home);
  expect(withoutEntry(voice, 999)).toBe(voice);
  if (music.kind !== PageKind.Music) throw new Error('Wrong fixture');
  const practice = { ...music.feature, title: 'New practice' };
  expect(withPractice(music, practice)).toMatchObject({
    feature: { title: 'New practice' },
  });
  expect(withPractice(home, practice)).toBe(home);
  expect(withPractice(music, { ...practice, pageId: 999 })).toBe(music);
});

it('applies full canonical order across each owned collection', () => {
  for (const [content, collection, id] of [
    [voice, PageCollection.Eyebrows, 100],
    [voice, PageCollection.Trivia, 101],
    [music, PageCollection.Releases, 50],
    [stream, PageCollection.StreamClips, 60],
    [press, PageCollection.Appearances, 70],
    [bio, PageCollection.BioChapters, 80],
    [bio, PageCollection.CurrentItems, 90],
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
  const featured = withFeaturedItem(voice, { pageId: 2, itemId: 40 });
  const ordered = withCollectionOrder(featured, {
    pageId: 2,
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [42, 40],
  });
  expect(
    entryPolicy.rows(ordered)!.map((row) => [row.id, row.sortOrder]),
  ).toEqual([
    [42, 0],
    [40, 1],
  ]);
  if (ordered.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(ordered.feature.itemId).toBe(40);
});

it('rejects partial, duplicate, foreign, unsupported, or incorrectly scoped orders without changing content', () => {
  const order: CollectionOrder = {
    pageId: 2,
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [42, 40],
  };
  for (const input of [
    { ...order, orderedIds: [40] },
    { ...order, orderedIds: [40, 40] },
    { ...order, orderedIds: [40, 999] },
    { ...order, pageId: 999 },
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
  expect(orderCollection(entryPolicy, voice, { ...order, pageId: 999 })).toBe(
    voice,
  );
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
        aCopyDTO({ page_id: 2 }),
        aCopyDTO({ id: 31, page_id: 2, key: 'second', sort_order: 1 }),
        aCopyDTO({
          id: 32,
          page_id: 2,
          key: 'roles-title',
          section: 'roles',
          kind: 'section_label',
          sort_order: 7,
        }),
      ],
    }),
  );
  const input: CollectionOrder = {
    pageId: 2,
    collection: PageCollection.Copy,
    section: 'intro',
    orderedIds: [31, 30],
  };
  const result = withCollectionOrder(content, input);
  expect(
    result.copy
      .filter((row) => row.section === 'intro')
      .map((row) => [row.id, row.sortOrder]),
  ).toEqual([
    [31, 0],
    [30, 1],
  ]);
  expect(result.copy.find((row) => row.section === 'roles')!.sortOrder).toBe(7);
  for (const invalid of [
    { ...input, section: null },
    { ...input, section: 'unknown' },
    { ...input, orderedIds: [30] },
  ])
    expect(withCollectionOrder(content, invalid)).toBe(content);
  expect(
    withCollectionOrder(home, {
      pageId: 1,
      collection: PageCollection.Copy,
      section: 'intro',
      orderedIds: [30],
    }),
  ).not.toBe(home);
  const empty = { ...home, copy: [] };
  expect(
    withCollectionOrder(empty, {
      pageId: 1,
      collection: PageCollection.Copy,
      section: 'intro',
      orderedIds: [],
    }),
  ).toMatchObject({ copy: [] });
  expect(
    withCopy(home, toPageCopy(aCopyDTO({ id: 31, key: 'new' }))).copy,
  ).toHaveLength(2);
});
