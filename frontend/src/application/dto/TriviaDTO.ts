import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface TriviaDTO extends OrderedPageRecordDTO {
  label: string;
  value: string;
}
export interface TriviaInputDTO extends PageScopeDTO {
  label: string;
  value: string;
}
