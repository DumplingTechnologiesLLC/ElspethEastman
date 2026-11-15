import type { LinkDTO } from './LinkDTO';
import type { ImageUseDTO } from './MediaAssetDTO';
import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface EntryMetadataDTO {
  id: number;
  entry_id: number;
  key: string;
  label: string;
  value: string;
  sort_order: number;
}
export interface ContentEntryDTO extends OrderedPageRecordDTO {
  title: string;
  eyebrow: string;
  description: string;
  image: ImageUseDTO | null;
  action: LinkDTO | null;
  category: string | null;
  published_at: string | null;
  metadata: EntryMetadataDTO[];
  is_featured: boolean;
}
export interface FeaturedItemDTO extends PageScopeDTO {
  item_id: number | null;
}
