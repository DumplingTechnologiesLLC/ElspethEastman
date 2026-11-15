import type {
  ContentEntry,
  EntryMetadata,
  FeaturedItem,
} from '../../domain/models/ContentEntry';
import type {
  ContentEntryDTO,
  EntryMetadataDTO,
  FeaturedItemDTO,
} from '../dto/ContentEntryDTO';
import { toOptionalLink } from './contentLinks';
import { toImageUse } from './contentMedia';
import { toOrderedPageRecord } from './contentPage';

export function toEntryMetadata(dto: EntryMetadataDTO): EntryMetadata {
  return {
    id: dto.id,
    entryId: dto.entry_id,
    key: dto.key,
    label: dto.label,
    value: dto.value,
    sortOrder: dto.sort_order,
  };
}
export function toContentEntry(dto: ContentEntryDTO): ContentEntry {
  return {
    ...toOrderedPageRecord(dto),
    title: dto.title,
    eyebrow: dto.eyebrow,
    description: dto.description,
    image: dto.image === null ? null : toImageUse(dto.image),
    action: toOptionalLink(dto.action),
    category: dto.category,
    publishedAt: dto.published_at,
    metadata: dto.metadata.map(toEntryMetadata),
    isFeatured: dto.is_featured,
  };
}
export function toFeaturedItem(dto: FeaturedItemDTO): FeaturedItem {
  return { pageId: dto.page_id, itemId: dto.item_id };
}
