import type {
  ContentEntryInput,
  EntryMetadataInput,
} from '../../domain/models/ContentEntry';
import type {
  ContentEntryInputDTO,
  EntryMetadataInputDTO,
} from '../dto/ContentEntryDTO';
import { mapDefined, mapNullable, suppliedField } from './writeFields';
import { writeImage, writeLink } from './writeSharedContent';

function writeFact(input: EntryMetadataInput): EntryMetadataInputDTO {
  return { key: input.key, label: input.label, value: input.value };
}
const field = suppliedField<Omit<ContentEntryInputDTO, 'page_id'>>();
export function writeContentEntry(
  input: Partial<Omit<ContentEntryInput, 'pageId'>>,
): Partial<Omit<ContentEntryInputDTO, 'page_id'>> {
  return {
    ...field('title', input.title),
    ...field('eyebrow', input.eyebrow),
    ...field('description', input.description),
    ...field(
      'image',
      mapDefined(input.image, (image) => mapNullable(image, writeImage)),
    ),
    ...field(
      'action',
      mapDefined(input.action, (action) => mapNullable(action, writeLink)),
    ),
    ...field('category', input.category),
    ...field('published_at', input.publishedAt),
    ...field(
      'metadata',
      mapDefined(input.metadata, (rows) => rows.map(writeFact)),
    ),
  };
}
