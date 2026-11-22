import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface EyebrowDTO extends OrderedPageRecordDTO {
  label: string;
}
export interface EyebrowInputDTO extends PageScopeDTO {
  label: string;
}
