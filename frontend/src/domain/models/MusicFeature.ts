import type { Link, LinkInput } from './Link';
import type { ImageUse, ImageUseInput } from './MediaAsset';
import type { PageScope } from './Page';

export interface PracticeFact {
  readonly label: string;
  readonly value: string;
}
export interface MusicFeatureInput extends PageScope {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly image: ImageUseInput;
  readonly facts: readonly PracticeFact[];
  readonly action: LinkInput;
}
export interface MusicFeature extends PageScope {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly image: ImageUse;
  readonly facts: readonly PracticeFact[];
  readonly action: Link;
}
