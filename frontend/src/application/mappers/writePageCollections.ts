import type { AppearanceInput } from '../../domain/models/Appearance';
import type { BioChapterInput } from '../../domain/models/BioChapter';
import type { CurrentItemInput } from '../../domain/models/CurrentItem';
import type { StreamClipInput } from '../../domain/models/StreamClip';
import type { AppearanceInputDTO } from '../dto/AppearanceDTO';
import type { BioChapterInputDTO } from '../dto/BioChapterDTO';
import type { CurrentItemInputDTO } from '../dto/CurrentItemDTO';
import type { StreamClipInputDTO } from '../dto/StreamClipDTO';
import { mapDefined, mapNullable, suppliedField } from './writeFields';
import { writeLink } from './writeSharedContent';

const clipField = suppliedField<Omit<StreamClipInputDTO, 'page_id'>>();
export function writeClip(
  input: Partial<Omit<StreamClipInput, 'pageId'>>,
): Partial<Omit<StreamClipInputDTO, 'page_id'>> {
  return {
    ...clipField('eyebrow', input.eyebrow),
    ...clipField('title', input.title),
    ...clipField('category', input.category),
    ...clipField('action', mapDefined(input.action, writeLink)),
  };
}
const appearanceField = suppliedField<Omit<AppearanceInputDTO, 'page_id'>>();
export function writeAppearance(
  input: Partial<Omit<AppearanceInput, 'pageId'>>,
): Partial<Omit<AppearanceInputDTO, 'page_id'>> {
  return {
    ...appearanceField('year', input.year),
    ...appearanceField('title', input.title),
    ...appearanceField('format', input.format),
    ...appearanceField('url', input.url),
  };
}
const chapterField = suppliedField<Omit<BioChapterInputDTO, 'page_id'>>();
export function writeChapter(
  input: Partial<Omit<BioChapterInput, 'pageId'>>,
): Partial<Omit<BioChapterInputDTO, 'page_id'>> {
  return {
    ...chapterField('eyebrow', input.eyebrow),
    ...chapterField('heading', input.heading),
    ...chapterField('body', input.body),
  };
}
const currentField = suppliedField<Omit<CurrentItemInputDTO, 'page_id'>>();
export function writeCurrentItem(
  input: Partial<Omit<CurrentItemInput, 'pageId'>>,
): Partial<Omit<CurrentItemInputDTO, 'page_id'>> {
  return {
    ...currentField('eyebrow', input.eyebrow),
    ...currentField('title', input.title),
    ...currentField('description', input.description),
    ...currentField(
      'link',
      mapDefined(input.link, (link) => mapNullable(link, writeLink)),
    ),
  };
}
