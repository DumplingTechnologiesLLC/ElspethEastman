import type { AppearanceDTO } from '../frontend/src/application/dto/AppearanceDTO';
import type { BioChapterDTO } from '../frontend/src/application/dto/BioChapterDTO';
import type { ContentEntryDTO } from '../frontend/src/application/dto/ContentEntryDTO';
import type { CurrentItemDTO } from '../frontend/src/application/dto/CurrentItemDTO';
import type {
  ImageUseDTO,
  MediaAssetDTO,
} from '../frontend/src/application/dto/MediaAssetDTO';
import type { MusicFeatureDTO } from '../frontend/src/application/dto/MusicFeatureDTO';
import type { MusicReleaseDTO } from '../frontend/src/application/dto/MusicReleaseDTO';
import type {
  BioContentDTO,
  HomeContentDTO,
  MusicContentDTO,
  PressContentDTO,
  SharedPageContentDTO,
  StreamingContentDTO,
  VoiceoverContentDTO,
} from '../frontend/src/application/dto/PageContentDTO';
import type { PageCopyDTO } from '../frontend/src/application/dto/PageCopyDTO';
import type {
  PageDTO,
  PageKindDTO,
} from '../frontend/src/application/dto/PageDTO';
import type { StreamClipDTO } from '../frontend/src/application/dto/StreamClipDTO';

const ids = {
  home: '00000000-0000-4000-8000-000000000001',
  voiceover: '00000000-0000-4000-8000-000000000002',
  music: '00000000-0000-4000-8000-000000000003',
  streaming: '00000000-0000-4000-8000-000000000004',
  press: '00000000-0000-4000-8000-000000000005',
  bio: '00000000-0000-4000-8000-000000000006',
};
export function aPageDTO<Kind extends PageKindDTO>(kind: Kind): PageDTO<Kind> {
  return {
    id: ids[kind],
    kind,
    title: kind,
    slug: kind === 'home' ? '' : kind,
    primary_action: null,
  };
}
export function aMediaAssetDTO(
  overrides: Partial<MediaAssetDTO> = {},
): MediaAssetDTO {
  return {
    id: '00000000-0000-4000-8000-000000000014',
    url: '/media/uploads/portrait.png',
    width: 800,
    height: 600,
    mime_type: 'image/png',
    credit: 'Photographer',
    source_url: 'https://example.invalid/source',
    created_at: '2026-10-01T14:30:00Z',
    ...overrides,
  };
}
export function anImageUseDTO(
  overrides: Partial<ImageUseDTO> = {},
): ImageUseDTO {
  return {
    asset: aMediaAssetDTO(),
    alt_text: 'Portrait',
    caption: 'In the studio',
    ...overrides,
  };
}
export function aCopyDTO(overrides: Partial<PageCopyDTO> = {}): PageCopyDTO {
  return {
    id: '00000000-0000-4000-8000-00000000001e',
    page_id: '00000000-0000-4000-8000-000000000001',
    key: 'intro-one',
    section: 'intro',
    kind: 'body',
    value: '<b>Plain text</b>',
    sort_order: 0,
    ...overrides,
  };
}
export function anEntryDTO(
  overrides: Partial<ContentEntryDTO> = {},
): ContentEntryDTO {
  return {
    id: '00000000-0000-4000-8000-000000000028',
    page_id: '00000000-0000-4000-8000-000000000002',
    title: 'Tristana',
    eyebrow: 'League of Legends',
    description: 'Character summary',
    image: anImageUseDTO(),
    action: {
      label: 'Project',
      href: 'https://example.invalid/project',
      is_external: true,
    },
    category: null,
    published_at: null,
    metadata: [
      {
        id: '00000000-0000-4000-8000-000000000029',
        entry_id: '00000000-0000-4000-8000-000000000028',
        key: 'details',
        label: 'Details',
        value: 'Character detail',
        sort_order: 0,
      },
    ],
    is_featured: false,
    sort_order: 0,
    ...overrides,
  };
}
export function aMusicFeatureDTO(
  overrides: Partial<MusicFeatureDTO> = {},
): MusicFeatureDTO {
  return {
    page_id: '00000000-0000-4000-8000-000000000003',
    eyebrow: 'Practice',
    title: 'Cello',
    description: 'Practice notes',
    image: anImageUseDTO(),
    facts: [{ label: 'Current study', value: 'Etude' }],
    action: {
      label: 'Watch',
      href: 'https://example.invalid/watch',
      is_external: true,
    },
    ...overrides,
  };
}
export function aReleaseDTO(
  overrides: Partial<MusicReleaseDTO> = {},
): MusicReleaseDTO {
  return {
    id: '00000000-0000-4000-8000-000000000032',
    page_id: '00000000-0000-4000-8000-000000000003',
    year: '2014',
    format: 'Album',
    title: 'Original music',
    description: 'Songs',
    artwork: anImageUseDTO(),
    artwork_title: 'Original music',
    action: {
      label: 'Listen',
      href: 'https://example.invalid/album',
      is_external: true,
    },
    sort_order: 0,
    ...overrides,
  };
}
export function aClipDTO(
  overrides: Partial<StreamClipDTO> = {},
): StreamClipDTO {
  return {
    id: '00000000-0000-4000-8000-00000000003c',
    page_id: '00000000-0000-4000-8000-000000000004',
    eyebrow: 'Game',
    title: 'Highlights',
    category: 'Highlights',
    action: {
      label: 'Play',
      href: 'https://example.invalid/clip',
      is_external: true,
    },
    sort_order: 0,
    ...overrides,
  };
}
export function anAppearanceDTO(
  overrides: Partial<AppearanceDTO> = {},
): AppearanceDTO {
  return {
    id: '00000000-0000-4000-8000-000000000046',
    page_id: '00000000-0000-4000-8000-000000000005',
    year: '2026',
    title: 'Convention',
    format: 'Panel',
    url: null,
    sort_order: 0,
    ...overrides,
  };
}
export function aChapterDTO(
  overrides: Partial<BioChapterDTO> = {},
): BioChapterDTO {
  return {
    id: '00000000-0000-4000-8000-000000000050',
    page_id: '00000000-0000-4000-8000-000000000006',
    eyebrow: 'Early years',
    heading: 'The beginning',
    body: 'A chapter',
    sort_order: 0,
    ...overrides,
  };
}
export function aCurrentItemDTO(
  overrides: Partial<CurrentItemDTO> = {},
): CurrentItemDTO {
  return {
    id: '00000000-0000-4000-8000-00000000005a',
    page_id: '00000000-0000-4000-8000-000000000006',
    eyebrow: 'Music',
    title: 'Practice',
    description: 'Current work',
    link: null,
    sort_order: 0,
    ...overrides,
  };
}
export function sharedDTO<Kind extends PageKindDTO>(
  kind: Kind,
): SharedPageContentDTO<Kind> {
  const page = aPageDTO(kind);
  return {
    page,
    copy: [aCopyDTO({ page_id: page.id })],
    images: [{ page_id: page.id, key: 'portrait', image: anImageUseDTO() }],
    eyebrows: [
      {
        id: '00000000-0000-4000-8000-000000000064',
        page_id: page.id,
        label: 'Voice actor',
        sort_order: 0,
      },
    ],
    trivia: [
      {
        id: '00000000-0000-4000-8000-000000000065',
        page_id: page.id,
        label: 'Since',
        value: '2012',
        sort_order: 0,
      },
    ],
  };
}
export function aHomeDTO(
  overrides: Partial<HomeContentDTO> = {},
): HomeContentDTO {
  return { ...sharedDTO('home'), ...overrides };
}
export function aVoiceoverDTO(
  overrides: Partial<VoiceoverContentDTO> = {},
): VoiceoverContentDTO {
  return {
    ...sharedDTO('voiceover'),
    roles: [anEntryDTO()],
    feature: { page_id: '00000000-0000-4000-8000-000000000002', item_id: null },
    ...overrides,
  };
}
export function aMusicDTO(
  overrides: Partial<MusicContentDTO> = {},
): MusicContentDTO {
  return {
    ...sharedDTO('music'),
    feature: aMusicFeatureDTO(),
    releases: [aReleaseDTO()],
    ...overrides,
  };
}
export function aStreamingDTO(
  overrides: Partial<StreamingContentDTO> = {},
): StreamingContentDTO {
  return {
    ...sharedDTO('streaming'),
    entries: [anEntryDTO({ page_id: '00000000-0000-4000-8000-000000000004' })],
    clips: [aClipDTO()],
    feature: {
      page_id: '00000000-0000-4000-8000-000000000004',
      item_id: '00000000-0000-4000-8000-000000000028',
    },
    ...overrides,
  };
}
export function aPressDTO(
  overrides: Partial<PressContentDTO> = {},
): PressContentDTO {
  return {
    ...sharedDTO('press'),
    entries: [
      anEntryDTO({
        page_id: '00000000-0000-4000-8000-000000000005',
        published_at: '2026-10-01T14:30:00Z',
        metadata: [
          {
            id: '00000000-0000-4000-8000-000000000029',
            entry_id: '00000000-0000-4000-8000-000000000028',
            key: 'outlet',
            label: 'Publication',
            value: 'Outlet',
            sort_order: 0,
          },
        ],
      }),
    ],
    appearances: [anAppearanceDTO()],
    feature: {
      page_id: '00000000-0000-4000-8000-000000000005',
      item_id: '00000000-0000-4000-8000-000000000028',
    },
    ...overrides,
  };
}
export function aBioDTO(overrides: Partial<BioContentDTO> = {}): BioContentDTO {
  return {
    ...sharedDTO('bio'),
    chapters: [aChapterDTO()],
    current_items: [aCurrentItemDTO()],
    ...overrides,
  };
}
