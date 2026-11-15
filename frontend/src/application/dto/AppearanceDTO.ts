import type { OrderedPageRecordDTO } from './PageDTO';

export interface AppearanceDTO extends OrderedPageRecordDTO {
  year: string;
  title: string;
  format: string;
  url: string | null;
}
