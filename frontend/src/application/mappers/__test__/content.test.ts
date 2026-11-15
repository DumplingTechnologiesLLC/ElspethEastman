import { expect, it } from 'vitest';
import {
  aBioDTO,
  aCopyDTO,
  aCurrentItemDTO,
  aHomeDTO,
  aMediaAssetDTO,
  aMusicDTO,
  aPageDTO,
  aPressDTO,
  aStreamingDTO,
  aVoiceoverDTO,
  anEntryDTO,
} from '../../../../../test/contentFixtures';
import { PageKind } from '../../../domain/models/Page';
import { PageCollection } from '../../../domain/models/PageCollection';
import type { PageContentDTO } from '../../dto/PageContentDTO';
import type { PageDTO } from '../../dto/PageDTO';
import type { PageCopyDTO } from '../../dto/PageCopyDTO';
import type { MediaAssetDTO } from '../../dto/MediaAssetDTO';
import type { CollectionOrderDTO } from '../../dto/PageCollectionDTO';
import { toPageContent } from '../contentAggregate';
import { toPage } from '../contentPage';
import { toContentEntry } from '../contentEntry';
import { toCollectionOrder, toCurrentItem } from '../contentCollections';
import { toMediaAsset } from '../contentMedia';
import { toPageCopy } from '../contentShared';

it.each([
  aHomeDTO(),
  aVoiceoverDTO(),
  aMusicDTO(),
  aStreamingDTO(),
  aPressDTO(),
  aBioDTO(),
])(
  'maps the $page.kind aggregate into its own immutable domain shape',
  (dto) => {
    const content = toPageContent(dto);
    expect(content.kind).toBe(dto.page.kind);
    expect(content.page.kind).toBe(content.kind);
    expect(content.copy[0]!.value).toBe('<b>Plain text</b>');
    expect(content.copy[0]!.pageId).toBe(dto.page.id);
    expect(content.images[0]!.image).toMatchObject({
      altText: 'Portrait',
      asset: {
        mimeType: 'image/png',
        sourceUrl: 'https://example.invalid/source',
      },
    });
    expect(content.eyebrows[0]!.label).toBe('Voice actor');
    expect(content.trivia[0]!.value).toBe('2012');
    expect(content).not.toHaveProperty('current_items');
  },
);

it('separates DTO objects and ordered nested metadata from domain ownership', () => {
  const dto = aVoiceoverDTO();
  const content = toPageContent(dto);
  expect(content.kind).toBe(PageKind.Voiceover);
  if (content.kind !== PageKind.Voiceover) throw new Error('Wrong fixture');
  expect(content.roles[0]!.metadata[0]).toEqual({
    id: 41,
    entryId: 40,
    key: 'details',
    label: 'Details',
    value: 'Character detail',
    sortOrder: 0,
  });
  expect(content.feature).toEqual({ pageId: 2, itemId: null });
  dto.roles[0]!.metadata[0]!.value = 'Changed outside the domain';
  dto.images[0]!.image.asset.credit = 'Changed credit';
  dto.copy.splice(0);
  expect(content.roles[0]!.metadata[0]!.value).toBe('Character detail');
  expect(content.images[0]!.image.asset.credit).toBe('Photographer');
  expect(content.copy).toHaveLength(1);
});

it('preserves optional imagery, actions, and the canonical UTC timestamp', () => {
  const entry = toContentEntry(
    anEntryDTO({
      image: null,
      action: null,
      published_at: '2026-10-01T14:30:00Z',
    }),
  );
  expect(entry.image).toBeNull();
  expect(entry.action).toBeNull();
  expect(entry.publishedAt).toBe('2026-10-01T14:30:00Z');
  expect(toCurrentItem(aCurrentItemDTO()).link).toBeNull();
  expect(
    toCurrentItem(
      aCurrentItemDTO({
        link: {
          label: 'Listen',
          href: 'https://example.invalid/listen',
          is_external: true,
        },
      }),
    ).link,
  ).toEqual({
    label: 'Listen',
    href: 'https://example.invalid/listen',
    isExternal: true,
  });
  expect(
    toPage({
      ...aPageDTO('voiceover'),
      primary_action: {
        label: 'Reel',
        href: 'https://example.invalid/reel',
        is_external: true,
      },
    }).primaryAction,
  ).toEqual({
    label: 'Reel',
    href: 'https://example.invalid/reel',
    isExternal: true,
  });
});

it('keeps music practice, releases, clips, appearances, and biography records distinct', () => {
  const music = toPageContent(aMusicDTO());
  if (music.kind !== PageKind.Music) throw new Error('Wrong fixture');
  expect(music.feature.facts).toEqual([
    { label: 'Current study', value: 'Etude' },
  ]);
  expect(music.releases[0]!.artworkTitle).toBe('Original music');
  const streaming = toPageContent(aStreamingDTO());
  if (streaming.kind !== PageKind.Streaming) throw new Error('Wrong fixture');
  expect(streaming.clips[0]!.action.href).toBe('https://example.invalid/clip');
  const press = toPageContent(aPressDTO());
  if (press.kind !== PageKind.Press) throw new Error('Wrong fixture');
  expect(press.appearances[0]!.url).toBeNull();
  const bio = toPageContent(aBioDTO());
  if (bio.kind !== PageKind.Bio) throw new Error('Wrong fixture');
  expect(bio.chapters[0]!.heading).toBe('The beginning');
  expect(bio.currentItems[0]!.description).toBe('Current work');
});

it('maps supported image formats and text treatments explicitly', () => {
  for (const mime_type of ['image/jpeg', 'image/png', 'image/webp'] as const)
    expect(toMediaAsset(aMediaAssetDTO({ mime_type })).mimeType).toBe(
      mime_type,
    );
  for (const kind of [
    'headline',
    'subheadline',
    'body',
    'section_label',
  ] as const)
    expect(toPageCopy(aCopyDTO({ kind })).kind).toBe(kind);
});

it('copies canonical collection order and rejects unknown wire discriminators', () => {
  const dto: CollectionOrderDTO = {
    page_id: 2,
    collection: 'content_entries',
    section: null,
    ordered_ids: [4, 2, 8],
  };
  const order = toCollectionOrder(dto);
  dto.ordered_ids.reverse();
  expect(order).toEqual({
    pageId: 2,
    collection: PageCollection.ContentEntries,
    section: null,
    orderedIds: [4, 2, 8],
  });
  expect(() =>
    toPage({ ...aPageDTO('home'), kind: 'constructor' } as unknown as PageDTO),
  ).toThrow('Unsupported page kind');
  expect(() =>
    toPageContent({
      ...aHomeDTO(),
      page: { ...aPageDTO('home'), kind: 'unknown' },
    } as unknown as PageContentDTO),
  ).toThrow('Unsupported page aggregate');
  expect(() =>
    toPageCopy({ ...aCopyDTO(), kind: 'markdown' } as unknown as PageCopyDTO),
  ).toThrow('Unsupported copy treatment');
  expect(() =>
    toMediaAsset({
      ...aMediaAssetDTO(),
      mime_type: 'image/svg+xml',
    } as unknown as MediaAssetDTO),
  ).toThrow('Unsupported image format');
  expect(() =>
    toCollectionOrder({
      ...dto,
      collection: '__proto__',
    } as unknown as CollectionOrderDTO),
  ).toThrow('Unsupported collection');
});
