import type { ImageUse, ImageUseInput } from './MediaAsset';
import type { KeyedPageScope } from './Page';

export interface PageImage extends KeyedPageScope {
  readonly image: ImageUse;
}
export interface PageImageInput extends KeyedPageScope {
  readonly image: ImageUseInput;
}
