import type { ImageUseDTO, ImageUseInputDTO } from './MediaAssetDTO';
import type { KeyedPageScopeDTO } from './PageDTO';

export interface PageImageDTO extends KeyedPageScopeDTO {
  image: ImageUseDTO;
}
export interface PageImageInputDTO extends KeyedPageScopeDTO {
  image: ImageUseInputDTO;
}
