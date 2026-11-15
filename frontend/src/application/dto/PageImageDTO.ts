import type { ImageUseDTO } from './MediaAssetDTO';
import type { KeyedPageScopeDTO } from './PageDTO';

export interface PageImageDTO extends KeyedPageScopeDTO {
  image: ImageUseDTO;
}
