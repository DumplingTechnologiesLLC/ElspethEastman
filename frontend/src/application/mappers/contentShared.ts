import { CopyKind } from '../../domain/models/PageCopy';
import type { PageCopy } from '../../domain/models/PageCopy';
import type { PageImage } from '../../domain/models/PageImage';
import type { Eyebrow } from '../../domain/models/Eyebrow';
import type { Trivia } from '../../domain/models/Trivia';
import type { CopyKindDTO, PageCopyDTO } from '../dto/PageCopyDTO';
import type { PageImageDTO } from '../dto/PageImageDTO';
import type { EyebrowDTO } from '../dto/EyebrowDTO';
import type { TriviaDTO } from '../dto/TriviaDTO';
import { toOrderedPageRecord } from './contentPage';
import { toImageUse } from './contentMedia';

const kinds = {
  headline: CopyKind.Headline,
  subheadline: CopyKind.Subheadline,
  body: CopyKind.Body,
  section_label: CopyKind.SectionLabel,
} as const satisfies Record<CopyKindDTO, CopyKind>;

export function toPageCopy(dto: PageCopyDTO): PageCopy {
  if (!Object.hasOwn(kinds, dto.kind))
    throw new Error('Unsupported copy treatment');
  const kind = kinds[dto.kind];
  return {
    ...toOrderedPageRecord(dto),
    key: dto.key,
    section: dto.section,
    kind,
    value: dto.value,
  };
}
export function toPageImage(dto: PageImageDTO): PageImage {
  return { pageId: dto.page_id, key: dto.key, image: toImageUse(dto.image) };
}
export function toEyebrow(dto: EyebrowDTO): Eyebrow {
  return { ...toOrderedPageRecord(dto), label: dto.label };
}
export function toTrivia(dto: TriviaDTO): Trivia {
  return { ...toOrderedPageRecord(dto), label: dto.label, value: dto.value };
}
