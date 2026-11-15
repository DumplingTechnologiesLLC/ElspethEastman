import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface BioChapterDTO extends OrderedPageRecordDTO {
  eyebrow: string;
  heading: string;
  body: string;
}
export interface BioChapterInputDTO extends PageScopeDTO {
  eyebrow: string;
  heading: string;
  body: string;
}
