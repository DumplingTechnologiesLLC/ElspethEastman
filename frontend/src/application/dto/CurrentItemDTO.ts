import type { LinkDTO } from './LinkDTO';
import type { OrderedPageRecordDTO } from './PageDTO';

export interface CurrentItemDTO extends OrderedPageRecordDTO {
  eyebrow: string;
  title: string;
  description: string;
  link: LinkDTO | null;
}
