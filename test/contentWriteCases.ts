import type { ContentRepository } from '../frontend/src/domain/ports/ContentRepository';
import type { ContentResult } from '../frontend/src/domain/models/ContentResult';
import {
  aChapterDTO,
  aClipDTO,
  aCurrentItemDTO,
  aReleaseDTO,
  anAppearanceDTO,
  anEntryDTO,
} from './contentFixtures';

export const image = {
  assetId: '00000000-0000-4000-8000-000000000014',
  altText: 'Portrait',
  caption: 'In the studio',
};
export const imageDTO = {
  asset_id: '00000000-0000-4000-8000-000000000014',
  alt_text: 'Portrait',
  caption: 'In the studio',
};
export const action = { label: 'Open', url: 'https://example.invalid/open' };

interface CollectionCase {
  name: string;
  path: string;
  dto: unknown;
  pageId: string;
  id: string;
  body: object;
  create: (repository: ContentRepository) => Promise<ContentResult<unknown>>;
  update: (repository: ContentRepository) => Promise<ContentResult<unknown>>;
  emptyUpdate: (
    repository: ContentRepository,
  ) => Promise<ContentResult<unknown>>;
  remove: (repository: ContentRepository) => Promise<ContentResult<void>>;
}
export const eyebrow = {
  pageId: '00000000-0000-4000-8000-000000000002',
  label: 'Voice actor',
};
export const trivia = {
  pageId: '00000000-0000-4000-8000-000000000002',
  label: 'Since',
  value: '2012',
};
export const entry = {
  pageId: '00000000-0000-4000-8000-000000000002',
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
      id: '00000000-0000-4000-8000-000000000029',
      entryId: '00000000-0000-4000-8000-000000000028',
      sortOrder: 0,
    },
  ],
  id: '00000000-0000-4000-8000-000000000028',
  isFeatured: true,
  sortOrder: 10,
};
export const release = {
  pageId: '00000000-0000-4000-8000-000000000003',
  year: '2014',
  format: 'Album',
  title: 'Music',
  description: 'Songs',
  artwork: image,
  artworkTitle: 'Music',
  action,
};
export const clip = {
  pageId: '00000000-0000-4000-8000-000000000004',
  eyebrow: 'Game',
  title: 'Clip',
  category: 'Highlights',
  action,
};
export const appearance = {
  pageId: '00000000-0000-4000-8000-000000000005',
  year: '2026',
  title: 'Panel',
  format: 'Panel',
  url: null,
};
export const chapter = {
  pageId: '00000000-0000-4000-8000-000000000006',
  eyebrow: 'Early years',
  heading: 'Beginning',
  body: 'Story',
};
export const current = {
  pageId: '00000000-0000-4000-8000-000000000006',
  eyebrow: 'Music',
  title: 'Practice',
  description: 'Notes',
  link: action,
};

export const cases = [
  {
    name: 'eyebrows',
    path: '/api/v2/pages/eyebrows/',
    pageId: '00000000-0000-4000-8000-000000000002',
    id: '00000000-0000-4000-8000-000000000064',
    dto: {
      id: '00000000-0000-4000-8000-000000000064',
      page_id: '00000000-0000-4000-8000-000000000002',
      label: 'Canonical label',
      sort_order: 0,
    },
    body: { label: 'Voice actor' },
    create: (r) => r.eyebrows.create(eyebrow),
    update: (r) =>
      r.eyebrows.update('00000000-0000-4000-8000-000000000064', eyebrow),
    emptyUpdate: (r) =>
      r.eyebrows.update('00000000-0000-4000-8000-000000000064', {}),
    remove: (r) => r.eyebrows.remove('00000000-0000-4000-8000-000000000064'),
  },
  {
    name: 'trivia',
    path: '/api/v2/pages/trivia/',
    pageId: '00000000-0000-4000-8000-000000000002',
    id: '00000000-0000-4000-8000-000000000065',
    dto: {
      id: '00000000-0000-4000-8000-000000000065',
      page_id: '00000000-0000-4000-8000-000000000002',
      label: 'Since',
      value: '2012',
      sort_order: 0,
    },
    body: { label: 'Since', value: '2012' },
    create: (r) => r.trivia.create(trivia),
    update: (r) =>
      r.trivia.update('00000000-0000-4000-8000-000000000065', trivia),
    emptyUpdate: (r) =>
      r.trivia.update('00000000-0000-4000-8000-000000000065', {}),
    remove: (r) => r.trivia.remove('00000000-0000-4000-8000-000000000065'),
  },
  {
    name: 'entries',
    path: '/api/v2/content/entries/',
    pageId: '00000000-0000-4000-8000-000000000002',
    id: '00000000-0000-4000-8000-000000000028',
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
    update: (r) =>
      r.entries.update('00000000-0000-4000-8000-000000000028', entry),
    emptyUpdate: (r) =>
      r.entries.update('00000000-0000-4000-8000-000000000028', {}),
    remove: (r) => r.entries.remove('00000000-0000-4000-8000-000000000028'),
  },
  {
    name: 'releases',
    path: '/api/v2/music/releases/',
    pageId: '00000000-0000-4000-8000-000000000003',
    id: '00000000-0000-4000-8000-000000000032',
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
    update: (r) =>
      r.releases.update('00000000-0000-4000-8000-000000000032', release),
    emptyUpdate: (r) =>
      r.releases.update('00000000-0000-4000-8000-000000000032', {}),
    remove: (r) => r.releases.remove('00000000-0000-4000-8000-000000000032'),
  },
  {
    name: 'clips',
    path: '/api/v2/streaming/clips/',
    pageId: '00000000-0000-4000-8000-000000000004',
    id: '00000000-0000-4000-8000-00000000003c',
    dto: aClipDTO(),
    body: { eyebrow: 'Game', title: 'Clip', category: 'Highlights', action },
    create: (r) => r.clips.create(clip),
    update: (r) => r.clips.update('00000000-0000-4000-8000-00000000003c', clip),
    emptyUpdate: (r) =>
      r.clips.update('00000000-0000-4000-8000-00000000003c', {}),
    remove: (r) => r.clips.remove('00000000-0000-4000-8000-00000000003c'),
  },
  {
    name: 'appearances',
    path: '/api/v2/press/appearances/',
    pageId: '00000000-0000-4000-8000-000000000005',
    id: '00000000-0000-4000-8000-000000000046',
    dto: anAppearanceDTO(),
    body: { year: '2026', title: 'Panel', format: 'Panel', url: null },
    create: (r) => r.appearances.create(appearance),
    update: (r) =>
      r.appearances.update('00000000-0000-4000-8000-000000000046', appearance),
    emptyUpdate: (r) =>
      r.appearances.update('00000000-0000-4000-8000-000000000046', {}),
    remove: (r) => r.appearances.remove('00000000-0000-4000-8000-000000000046'),
  },
  {
    name: 'chapters',
    path: '/api/v2/bio/chapters/',
    pageId: '00000000-0000-4000-8000-000000000006',
    id: '00000000-0000-4000-8000-000000000050',
    dto: aChapterDTO(),
    body: { eyebrow: 'Early years', heading: 'Beginning', body: 'Story' },
    create: (r) => r.chapters.create(chapter),
    update: (r) =>
      r.chapters.update('00000000-0000-4000-8000-000000000050', chapter),
    emptyUpdate: (r) =>
      r.chapters.update('00000000-0000-4000-8000-000000000050', {}),
    remove: (r) => r.chapters.remove('00000000-0000-4000-8000-000000000050'),
  },
  {
    name: 'current items',
    path: '/api/v2/bio/current/',
    pageId: '00000000-0000-4000-8000-000000000006',
    id: '00000000-0000-4000-8000-00000000005a',
    dto: aCurrentItemDTO(),
    body: {
      eyebrow: 'Music',
      title: 'Practice',
      description: 'Notes',
      link: action,
    },
    create: (r) => r.currentItems.create(current),
    update: (r) =>
      r.currentItems.update('00000000-0000-4000-8000-00000000005a', current),
    emptyUpdate: (r) =>
      r.currentItems.update('00000000-0000-4000-8000-00000000005a', {}),
    remove: (r) =>
      r.currentItems.remove('00000000-0000-4000-8000-00000000005a'),
  },
] as const satisfies readonly CollectionCase[];
