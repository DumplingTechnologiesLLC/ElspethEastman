import type { MusicFeatureInput } from '../../domain/models/MusicFeature';
import type { MusicReleaseInput } from '../../domain/models/MusicRelease';
import type { MusicFeatureInputDTO } from '../dto/MusicFeatureDTO';
import type { MusicReleaseInputDTO } from '../dto/MusicReleaseDTO';
import { mapDefined, suppliedField } from './writeFields';
import { writeImage, writeLink } from './writeSharedContent';

export function writePractice(input: MusicFeatureInput): MusicFeatureInputDTO {
  return {
    page_id: input.pageId,
    eyebrow: input.eyebrow,
    title: input.title,
    description: input.description,
    image: writeImage(input.image),
    facts: input.facts.map((fact) => ({
      label: fact.label,
      value: fact.value,
    })),
    action: writeLink(input.action),
  };
}
const field = suppliedField<Omit<MusicReleaseInputDTO, 'page_id'>>();
export function writeRelease(
  input: Partial<Omit<MusicReleaseInput, 'pageId'>>,
): Partial<Omit<MusicReleaseInputDTO, 'page_id'>> {
  return {
    ...field('year', input.year),
    ...field('format', input.format),
    ...field('title', input.title),
    ...field('description', input.description),
    ...field('artwork', mapDefined(input.artwork, writeImage)),
    ...field('artwork_title', input.artworkTitle),
    ...field('action', mapDefined(input.action, writeLink)),
  };
}
