import type { LinkDTO, LinkInputDTO } from './LinkDTO';
import type { ImageUseDTO, ImageUseInputDTO } from './MediaAssetDTO';
import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface MusicReleaseDTO extends OrderedPageRecordDTO {
  year: string;
  format: string;
  title: string;
  description: string;
  artwork: ImageUseDTO;
  artwork_title: string;
  action: LinkDTO;
}
export interface MusicReleaseInputDTO extends PageScopeDTO {
  year: string;
  format: string;
  title: string;
  description: string;
  artwork: ImageUseInputDTO;
  artwork_title: string;
  action: LinkInputDTO;
}
