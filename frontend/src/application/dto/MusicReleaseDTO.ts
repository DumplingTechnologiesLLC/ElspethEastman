import type { LinkDTO } from './LinkDTO';
import type { ImageUseDTO } from './MediaAssetDTO';
import type { OrderedPageRecordDTO } from './PageDTO';

export interface MusicReleaseDTO extends OrderedPageRecordDTO {
  year: string;
  format: string;
  title: string;
  description: string;
  artwork: ImageUseDTO;
  artwork_title: string;
  action: LinkDTO;
}
