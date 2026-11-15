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
  assetId: 20,
  altText: 'Portrait',
  caption: 'In the studio',
};
export const imageDTO = {
  asset_id: 20,
  alt_text: 'Portrait',
  caption: 'In the studio',
};
export const action = { label: 'Open', url: 'https://example.invalid/open' };

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
export const eyebrow = { pageId: 2, label: 'Voice actor' };
export const trivia = { pageId: 2, label: 'Since', value: '2012' };
export const entry = {
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
export const release = {
  pageId: 3,
  year: '2014',
  format: 'Album',
  title: 'Music',
  description: 'Songs',
  artwork: image,
  artworkTitle: 'Music',
  action,
};
export const clip = {
  pageId: 4,
  eyebrow: 'Game',
  title: 'Clip',
  category: 'Highlights',
  action,
};
export const appearance = {
  pageId: 5,
  year: '2026',
  title: 'Panel',
  format: 'Panel',
  url: null,
};
export const chapter = {
  pageId: 6,
  eyebrow: 'Early years',
  heading: 'Beginning',
  body: 'Story',
};
export const current = {
  pageId: 6,
  eyebrow: 'Music',
  title: 'Practice',
  description: 'Notes',
  link: action,
};

export const cases = [
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
] as const satisfies readonly CollectionCase[];
