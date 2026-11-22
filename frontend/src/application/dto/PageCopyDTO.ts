import type { KeyedPageScopeDTO, OrderedPageRecordDTO } from './PageDTO';

export type CopyKindDTO = 'headline' | 'subheadline' | 'body' | 'section_label';
export interface PageCopyDTO extends KeyedPageScopeDTO, OrderedPageRecordDTO {
  section: string;
  kind: CopyKindDTO;
  value: string;
}
export interface CopyInputDTO extends KeyedPageScopeDTO {
  section: string;
  kind: CopyKindDTO;
  value: string;
}
export interface CopyChangesDTO extends KeyedPageScopeDTO {
  kind?: CopyKindDTO;
  value?: string;
}
