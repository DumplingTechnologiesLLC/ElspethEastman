import type { LinkInput } from '../../domain/models/Link';
import type { ImageUseInput } from '../../domain/models/MediaAsset';
import type { PageMetadataInput } from '../../domain/models/Page';
import type { CopyChanges, CopyInput } from '../../domain/models/PageCopy';
import type { PageImageInput } from '../../domain/models/PageImage';
import type { EyebrowInput } from '../../domain/models/Eyebrow';
import type { TriviaInput } from '../../domain/models/Trivia';
import type { FeaturedItem } from '../../domain/models/ContentEntry';
import type { CollectionOrder } from '../../domain/models/PageCollection';
import type { LinkInputDTO } from '../dto/LinkDTO';
import type { ImageUseInputDTO } from '../dto/MediaAssetDTO';
import type { PageMetadataInputDTO } from '../dto/PageDTO';
import type { CopyChangesDTO, CopyInputDTO } from '../dto/PageCopyDTO';
import type { PageImageInputDTO } from '../dto/PageImageDTO';
import type { EyebrowInputDTO } from '../dto/EyebrowDTO';
import type { TriviaInputDTO } from '../dto/TriviaDTO';
import type { FeaturedItemDTO } from '../dto/ContentEntryDTO';
import type { CollectionOrderDTO } from '../dto/PageCollectionDTO';
import { mapDefined, mapNullable, suppliedField } from './writeFields';

export function writeLink(input: LinkInput): LinkInputDTO {
  return { label: input.label, url: input.url };
}
export function writeImage(input: ImageUseInput): ImageUseInputDTO {
  return {
    asset_id: input.assetId,
    alt_text: input.altText,
    caption: input.caption,
  };
}

const pageField = suppliedField<PageMetadataInputDTO>();
export function writeMetadata(input: PageMetadataInput): PageMetadataInputDTO {
  return {
    ...pageField('title', input.title),
    ...pageField('slug', input.slug),
    ...pageField(
      'primary_action',
      mapDefined(input.primaryAction, (action) =>
        mapNullable(action, writeLink),
      ),
    ),
  };
}
export function writeCopy(input: CopyInput): CopyInputDTO {
  return {
    page_id: input.pageId,
    key: input.key,
    section: input.section,
    kind: input.kind,
    value: input.value,
  };
}
const copyField = suppliedField<Pick<CopyChangesDTO, 'kind' | 'value'>>();
export function writeCopyChanges(input: CopyChanges): CopyChangesDTO {
  return {
    page_id: input.pageId,
    key: input.key,
    ...copyField('kind', input.kind),
    ...copyField('value', input.value),
  };
}
export function writePageImage(input: PageImageInput): PageImageInputDTO {
  return {
    page_id: input.pageId,
    key: input.key,
    image: writeImage(input.image),
  };
}
const eyebrowField = suppliedField<Omit<EyebrowInputDTO, 'page_id'>>();
export function writeEyebrow(
  input: Partial<Omit<EyebrowInput, 'pageId'>>,
): Partial<Omit<EyebrowInputDTO, 'page_id'>> {
  return eyebrowField('label', input.label);
}
const triviaField = suppliedField<Omit<TriviaInputDTO, 'page_id'>>();
export function writeTrivia(
  input: Partial<Omit<TriviaInput, 'pageId'>>,
): Partial<Omit<TriviaInputDTO, 'page_id'>> {
  return {
    ...triviaField('label', input.label),
    ...triviaField('value', input.value),
  };
}
export function writeFeature(input: FeaturedItem): FeaturedItemDTO {
  return { page_id: input.pageId, item_id: input.itemId };
}
export function writeOrder(input: CollectionOrder): CollectionOrderDTO {
  return {
    page_id: input.pageId,
    collection: input.collection,
    section: input.section,
    ordered_ids: [...input.orderedIds],
  };
}
