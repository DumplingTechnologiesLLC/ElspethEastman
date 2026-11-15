import type { MusicFeature } from '../../domain/models/MusicFeature';
import type { MusicRelease } from '../../domain/models/MusicRelease';
import type { MusicFeatureDTO } from '../dto/MusicFeatureDTO';
import type { MusicReleaseDTO } from '../dto/MusicReleaseDTO';
import { toImageUse } from './contentMedia';
import { toLink } from './contentLinks';
import { toOrderedPageRecord } from './contentPage';

export function toMusicFeature(dto: MusicFeatureDTO): MusicFeature {
  return {
    pageId: dto.page_id,
    eyebrow: dto.eyebrow,
    title: dto.title,
    description: dto.description,
    image: toImageUse(dto.image),
    facts: dto.facts.map((fact) => ({ label: fact.label, value: fact.value })),
    action: toLink(dto.action),
  };
}
export function toMusicRelease(dto: MusicReleaseDTO): MusicRelease {
  return {
    ...toOrderedPageRecord(dto),
    year: dto.year,
    format: dto.format,
    title: dto.title,
    description: dto.description,
    artwork: toImageUse(dto.artwork),
    artworkTitle: dto.artwork_title,
    action: toLink(dto.action),
  };
}
