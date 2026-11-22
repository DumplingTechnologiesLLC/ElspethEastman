import type { LinkDTO, LinkInputDTO } from './LinkDTO';
import type { ImageUseDTO, ImageUseInputDTO } from './MediaAssetDTO';
import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface EntryMetadataDTO {
  id: string;
  entry_id: string;
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
  item_id: string | null;
}
export interface EntryMetadataInputDTO {
  key: string;
  label: string;
  value: string;
}
export interface ContentEntryInputDTO extends PageScopeDTO {
  title: string;
  eyebrow: string;
  description: string;
  image: ImageUseInputDTO | null;
  action: LinkInputDTO | null;
  category: string | null;
  published_at: string | null;
  metadata: EntryMetadataInputDTO[];
}
