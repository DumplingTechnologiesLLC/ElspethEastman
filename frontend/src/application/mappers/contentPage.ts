import { PageKind } from '../../domain/models/Page';
import type { OrderedPageRecord, Page } from '../../domain/models/Page';
import type {
  OrderedPageRecordDTO,
  PageDTO,
  PageKindDTO,
} from '../dto/PageDTO';
import { toOptionalLink } from './contentLinks';

const kinds = {
  home: PageKind.Home,
  voiceover: PageKind.Voiceover,
  music: PageKind.Music,
  streaming: PageKind.Streaming,
  press: PageKind.Press,
  bio: PageKind.Bio,
} as const satisfies Record<PageKindDTO, PageKind>;
export type DomainPageKind<Kind extends PageKindDTO> = (typeof kinds)[Kind];

export function toPage<Kind extends PageKindDTO>(
  dto: PageDTO<Kind>,
): Page<DomainPageKind<Kind>> {
  if (!Object.hasOwn(kinds, dto.kind)) throw new Error('Unsupported page kind');
  const kind = kinds[dto.kind];
  return {
    id: dto.id,
    kind,
    title: dto.title,
    slug: dto.slug,
    primaryAction: toOptionalLink(dto.primary_action),
  };
}
export function toOrderedPageRecord(
  dto: OrderedPageRecordDTO,
): OrderedPageRecord {
  return { id: dto.id, pageId: dto.page_id, sortOrder: dto.sort_order };
}
