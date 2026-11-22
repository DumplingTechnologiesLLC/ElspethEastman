import type { Link, LinkInput } from './Link';
import type { ImageUse, ImageUseInput } from './MediaAsset';
import type { OrderedPageRecord, PageScope } from './Page';

export interface MusicReleaseInput extends PageScope {
  readonly year: string;
  readonly format: string;
  readonly title: string;
  readonly description: string;
  readonly artwork: ImageUseInput;
  readonly artworkTitle: string;
  readonly action: LinkInput;
}
export interface MusicRelease extends OrderedPageRecord {
  readonly year: string;
  readonly format: string;
  readonly title: string;
  readonly description: string;
  readonly artwork: ImageUse;
  readonly artworkTitle: string;
  readonly action: Link;
}
