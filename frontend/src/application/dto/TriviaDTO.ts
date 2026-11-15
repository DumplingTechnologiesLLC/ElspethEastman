import type { OrderedPageRecordDTO } from './PageDTO';

export interface TriviaDTO extends OrderedPageRecordDTO {
  label: string;
  value: string;
}
