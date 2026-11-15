import type { OrderedPageRecordDTO } from './PageDTO';

export interface BioChapterDTO extends OrderedPageRecordDTO {
  eyebrow: string;
  heading: string;
  body: string;
}
