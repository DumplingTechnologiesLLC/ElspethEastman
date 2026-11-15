import type { Link, LinkInput } from './Link';
import type { OrderedPageRecord, PageScope } from './Page';

export interface StreamClipInput extends PageScope {
  readonly eyebrow: string;
  readonly title: string;
  readonly category: string;
  readonly action: LinkInput;
}
export interface StreamClip extends OrderedPageRecord {
  readonly eyebrow: string;
  readonly title: string;
  readonly category: string;
  readonly action: Link;
}
