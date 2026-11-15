import type { LinkDTO, LinkInputDTO } from './LinkDTO';

export type PageKindDTO =
  'home' | 'voiceover' | 'music' | 'streaming' | 'press' | 'bio';
export interface PageDTO<Kind extends PageKindDTO = PageKindDTO> {
  id: number;
  kind: Kind;
  title: string;
  slug: string;
  primary_action: LinkDTO | null;
}
export interface PageScopeDTO {
  page_id: number;
}
export interface KeyedPageScopeDTO extends PageScopeDTO {
  key: string;
}
export interface OrderedPageRecordDTO extends PageScopeDTO {
  id: number;
  sort_order: number;
}
export interface SiteDTO {
  pages: PageDTO[];
}
export interface PageMetadataInputDTO {
  title?: string;
  slug?: string;
  primary_action?: LinkInputDTO | null;
}
