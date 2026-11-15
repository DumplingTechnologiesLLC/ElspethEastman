import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface AppearanceDTO extends OrderedPageRecordDTO {
  year: string;
  title: string;
  format: string;
  url: string | null;
}
export interface AppearanceInputDTO extends PageScopeDTO {
  year: string;
  title: string;
  format: string;
  url: string | null;
}
