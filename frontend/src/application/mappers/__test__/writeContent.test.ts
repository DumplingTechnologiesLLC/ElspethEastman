import { expect, it } from 'vitest';
import {
  cases,
  action,
  image,
  imageDTO,
  eyebrow,
  trivia,
  entry,
  release,
  clip,
  appearance,
  chapter,
  current,
} from '../../../../../test/contentWriteCases';
import { CopyKind } from '../../../domain/models/PageCopy';
import { PageCollection } from '../../../domain/models/PageCollection';
import { writeContentEntry } from '../writeContentEntry';
import { writePractice, writeRelease } from '../writeMusic';
import {
  writeAppearance,
  writeChapter,
  writeClip,
  writeCurrentItem,
} from '../writePageCollections';
import {
  writeCopy,
  writeCopyChanges,
  writeEyebrow,
  writeFeature,
  writeMetadata,
  writeOrder,
  writePageImage,
  writeTrivia,
} from '../writeSharedContent';

const writers = {
  eyebrows: {
    full: () => writeEyebrow(eyebrow),
    empty: () => writeEyebrow({}),
  },
  trivia: { full: () => writeTrivia(trivia), empty: () => writeTrivia({}) },
  entries: {
    full: () => writeContentEntry(entry),
    empty: () => writeContentEntry({}),
  },
  releases: {
    full: () => writeRelease(release),
    empty: () => writeRelease({}),
  },
  clips: { full: () => writeClip(clip), empty: () => writeClip({}) },
  appearances: {
    full: () => writeAppearance(appearance),
    empty: () => writeAppearance({}),
  },
  chapters: {
    full: () => writeChapter(chapter),
    empty: () => writeChapter({}),
  },
  'current items': {
    full: () => writeCurrentItem(current),
    empty: () => writeCurrentItem({}),
  },
};

it.each(cases)(
  'whitelists the $name write shape and omits unchanged fields',
  (testCase) => {
    const writer = writers[testCase.name];
    expect(writer.full()).toEqual(testCase.body);
    expect(writer.empty()).toEqual({});
  },
);

it('keeps page identity out of metadata edits and distinguishes omission from clearing', () => {
  const input = {
    title: 'Characters',
    slug: 'characters',
    primaryAction: action,
    id: 2,
    kind: 'voiceover',
  };
  expect(writeMetadata(input)).toEqual({
    title: 'Characters',
    slug: 'characters',
    primary_action: action,
  });
  expect(writeMetadata({ primaryAction: null })).toEqual({
    primary_action: null,
  });
  expect(writeMetadata({})).toEqual({});
});

it('keeps copy addresses required without allowing an update to move sections', () => {
  const input = {
    pageId: 1,
    key: 'intro',
    section: 'intro',
    kind: CopyKind.Body,
    value: 'Text',
    id: 30,
    sortOrder: 4,
  };
  expect(writeCopy(input)).toEqual({
    page_id: 1,
    key: 'intro',
    section: 'intro',
    kind: 'body',
    value: 'Text',
  });
  expect(writeCopyChanges(input)).toEqual({
    page_id: 1,
    key: 'intro',
    kind: 'body',
    value: 'Text',
  });
  expect(writeCopyChanges({ pageId: 1, key: 'intro' })).toEqual({
    page_id: 1,
    key: 'intro',
  });
  expect(writePageImage({ pageId: 1, key: 'hero', image })).toEqual({
    page_id: 1,
    key: 'hero',
    image: imageDTO,
  });
});

it('preserves explicit nulls and empty fact replacement without leaking nested record identity', () => {
  expect(
    writeContentEntry({
      image: null,
      action: null,
      metadata: [],
      category: 'Interview',
      publishedAt: '2026-10-01T14:30:00Z',
    }),
  ).toEqual({
    image: null,
    action: null,
    metadata: [],
    category: 'Interview',
    published_at: '2026-10-01T14:30:00Z',
  });
  expect(writeCurrentItem({ link: null })).toEqual({ link: null });
  expect(writeContentEntry(entry).metadata).toEqual([
    { key: 'details', label: 'Detail', value: 'Text' },
  ]);
});

it('maps complete practice values and copies collection order while preserving hero identity', () => {
  expect(
    writePractice({
      pageId: 3,
      eyebrow: 'Practice',
      title: 'Cello',
      description: 'Notes',
      image,
      facts: [{ label: 'Focus', value: 'Bowing' }],
      action,
    }),
  ).toEqual({
    page_id: 3,
    eyebrow: 'Practice',
    title: 'Cello',
    description: 'Notes',
    image: imageDTO,
    facts: [{ label: 'Focus', value: 'Bowing' }],
    action,
  });
  const ids = [41, 40];
  const order = writeOrder({
    pageId: 2,
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: ids,
  });
  ids.reverse();
  expect(order).toEqual({
    page_id: 2,
    collection: 'content_entries',
    section: null,
    ordered_ids: [41, 40],
  });
  expect(writeFeature({ pageId: 2, itemId: 40 })).toEqual({
    page_id: 2,
    item_id: 40,
  });
  expect(writeFeature({ pageId: 2, itemId: null })).toEqual({
    page_id: 2,
    item_id: null,
  });
});
