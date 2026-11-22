import type { LinkDTO } from './LinkDTO';

export type PageKindDTO =
  'home' | 'voiceover' | 'music' | 'streaming' | 'press' | 'bio';
export interface PageDTO<Kind extends PageKindDTO = PageKindDTO> {
  id: string;
  kind: Kind;
  title: string;
  slug: string;
  primary_action: LinkDTO | null;
}
export interface PageScopeDTO {
  page_id: string;
}
export interface KeyedPageScopeDTO extends PageScopeDTO {
  key: string;
}
export interface OrderedPageRecordDTO extends PageScopeDTO {
  id: string;
  sort_order: number;
}
export interface SiteDTO {
  pages: PageDTO[];
}
