import type { Link, LinkInput } from './Link';
import type { ImageUse, ImageUseInput } from './MediaAsset';
import type { OrderedPageRecord, PageScope } from './Page';

export interface EntryMetadataInput {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}
export interface EntryMetadata extends EntryMetadataInput {
  readonly id: number;
  readonly entryId: number;
  readonly sortOrder: number;
}
export interface ContentEntryInput extends PageScope {
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly image: ImageUseInput | null;
  readonly action: LinkInput | null;
  readonly category: string | null;
  readonly publishedAt: string | null;
  readonly metadata: readonly EntryMetadataInput[];
}
export interface ContentEntry extends OrderedPageRecord {
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly image: ImageUse | null;
  readonly action: Link | null;
  readonly category: string | null;
  readonly publishedAt: string | null;
  readonly metadata: readonly EntryMetadata[];
  readonly isFeatured: boolean;
}
export interface FeaturedItem extends PageScope {
  readonly itemId: number | null;
}
