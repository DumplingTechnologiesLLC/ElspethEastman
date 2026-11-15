import type { LinkDTO, LinkInputDTO } from './LinkDTO';
import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface StreamClipDTO extends OrderedPageRecordDTO {
  eyebrow: string;
  title: string;
  category: string;
  action: LinkDTO;
}
export interface StreamClipInputDTO extends PageScopeDTO {
  eyebrow: string;
  title: string;
  category: string;
  action: LinkInputDTO;
}
