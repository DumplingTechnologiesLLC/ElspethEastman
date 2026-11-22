import type { PageScopeDTO } from './PageDTO';

export type PageCollectionDTO =
  | 'copy'
  | 'eyebrows'
  | 'trivia'
  | 'content_entries'
  | 'releases'
  | 'stream_clips'
  | 'appearances'
  | 'bio_chapters'
  | 'current_items';
export interface CollectionOrderDTO extends PageScopeDTO {
  collection: PageCollectionDTO;
  section: string | null;
  ordered_ids: string[];
}
