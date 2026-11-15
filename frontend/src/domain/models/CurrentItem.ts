import type { Link, LinkInput } from './Link';
import type { OrderedPageRecord, PageScope } from './Page';

export interface CurrentItemInput extends PageScope {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly link: LinkInput | null;
}
export interface CurrentItem extends OrderedPageRecord {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly link: Link | null;
}
