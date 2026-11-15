import type { LinkDTO } from './LinkDTO';
import type { ImageUseDTO } from './MediaAssetDTO';
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
