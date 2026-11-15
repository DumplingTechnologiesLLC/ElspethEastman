import type { OrderedPageRecord, PageScope } from './Page';

export interface EyebrowInput extends PageScope {
  readonly label: string;
}
export interface Eyebrow extends EyebrowInput, OrderedPageRecord {}
