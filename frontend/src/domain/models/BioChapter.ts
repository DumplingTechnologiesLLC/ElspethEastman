import type { OrderedPageRecord, PageScope } from './Page';

export interface BioChapterInput extends PageScope {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
}
export interface BioChapter extends BioChapterInput, OrderedPageRecord {}
