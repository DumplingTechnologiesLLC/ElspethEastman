import type { OrderedPageRecord, PageScope } from './Page';

export interface AppearanceInput extends PageScope {
  readonly year: string;
  readonly title: string;
  readonly format: string;
  readonly url: string | null;
}
export interface Appearance extends AppearanceInput, OrderedPageRecord {}
