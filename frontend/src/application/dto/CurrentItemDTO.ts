import type { LinkDTO, LinkInputDTO } from './LinkDTO';
import type { OrderedPageRecordDTO, PageScopeDTO } from './PageDTO';

export interface CurrentItemDTO extends OrderedPageRecordDTO {
  eyebrow: string;
  title: string;
  description: string;
  link: LinkDTO | null;
}
export interface CurrentItemInputDTO extends PageScopeDTO {
  eyebrow: string;
  title: string;
  description: string;
  link: LinkInputDTO | null;
}
