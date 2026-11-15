import type { LinkDTO, LinkInputDTO } from './LinkDTO';
import type { ImageUseDTO, ImageUseInputDTO } from './MediaAssetDTO';
import type { PageScopeDTO } from './PageDTO';

export interface PracticeFactDTO {
  label: string;
  value: string;
}
export interface MusicFeatureDTO extends PageScopeDTO {
  eyebrow: string;
  title: string;
  description: string;
  image: ImageUseDTO;
  facts: PracticeFactDTO[];
  action: LinkDTO;
}
export interface MusicFeatureInputDTO extends PageScopeDTO {
  eyebrow: string;
  title: string;
  description: string;
  image: ImageUseInputDTO;
  facts: PracticeFactDTO[];
  action: LinkInputDTO;
}
