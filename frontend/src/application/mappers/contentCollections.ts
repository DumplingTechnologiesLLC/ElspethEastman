import type { Appearance } from '../../domain/models/Appearance';
import type { BioChapter } from '../../domain/models/BioChapter';
import type { CurrentItem } from '../../domain/models/CurrentItem';
import type { StreamClip } from '../../domain/models/StreamClip';
import type { CollectionOrder } from '../../domain/models/PageCollection';
import { PageCollection } from '../../domain/models/PageCollection';
import type { AppearanceDTO } from '../dto/AppearanceDTO';
import type { BioChapterDTO } from '../dto/BioChapterDTO';
import type { CurrentItemDTO } from '../dto/CurrentItemDTO';
import type { StreamClipDTO } from '../dto/StreamClipDTO';
import type {
  CollectionOrderDTO,
  PageCollectionDTO,
} from '../dto/PageCollectionDTO';
import { toOptionalLink, toLink } from './contentLinks';
import { toOrderedPageRecord } from './contentPage';

const collections = {
  copy: PageCollection.Copy,
  eyebrows: PageCollection.Eyebrows,
  trivia: PageCollection.Trivia,
  content_entries: PageCollection.ContentEntries,
  releases: PageCollection.Releases,
  stream_clips: PageCollection.StreamClips,
  appearances: PageCollection.Appearances,
  bio_chapters: PageCollection.BioChapters,
  current_items: PageCollection.CurrentItems,
} as const satisfies Record<PageCollectionDTO, PageCollection>;

export function toStreamClip(dto: StreamClipDTO): StreamClip {
  return {
    ...toOrderedPageRecord(dto),
    eyebrow: dto.eyebrow,
    title: dto.title,
    category: dto.category,
    action: toLink(dto.action),
  };
}
export function toAppearance(dto: AppearanceDTO): Appearance {
  return {
    ...toOrderedPageRecord(dto),
    year: dto.year,
    title: dto.title,
    format: dto.format,
    url: dto.url,
  };
}
export function toBioChapter(dto: BioChapterDTO): BioChapter {
  return {
    ...toOrderedPageRecord(dto),
    eyebrow: dto.eyebrow,
    heading: dto.heading,
    body: dto.body,
  };
}
export function toCurrentItem(dto: CurrentItemDTO): CurrentItem {
  return {
    ...toOrderedPageRecord(dto),
    eyebrow: dto.eyebrow,
    title: dto.title,
    description: dto.description,
    link: toOptionalLink(dto.link),
  };
}
export function toCollectionOrder(dto: CollectionOrderDTO): CollectionOrder {
  if (!Object.hasOwn(collections, dto.collection))
    throw new Error('Unsupported collection');
  const collection = collections[dto.collection];
  return {
    pageId: dto.page_id,
    collection,
    section: dto.section,
    orderedIds: [...dto.ordered_ids],
  };
}
