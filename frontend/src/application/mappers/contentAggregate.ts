import { PageKind } from '../../domain/models/Page';
import type {
  PageContent,
  SharedPageContent,
} from '../../domain/models/PageContent';
import type {
  PageContentDTO,
  SharedPageContentDTO,
} from '../dto/PageContentDTO';
import type { PageDTO, PageKindDTO } from '../dto/PageDTO';
import { toContentEntry, toFeaturedItem } from './contentEntry';
import {
  toAppearance,
  toBioChapter,
  toCurrentItem,
  toStreamClip,
} from './contentCollections';
import { toMusicFeature, toMusicRelease } from './contentMusic';
import { toPage } from './contentPage';
import type { DomainPageKind } from './contentPage';
import { toEyebrow, toPageCopy, toPageImage, toTrivia } from './contentShared';

function shared<Kind extends PageKindDTO>(
  dto: SharedPageContentDTO<Kind>,
): SharedPageContent<DomainPageKind<Kind>> {
  return {
    page: toPage(dto.page),
    copy: dto.copy.map(toPageCopy),
    images: dto.images.map(toPageImage),
    eyebrows: dto.eyebrows.map(toEyebrow),
    trivia: dto.trivia.map(toTrivia),
  };
}

function hasKind<Kind extends PageKindDTO>(
  dto: PageContentDTO,
  kind: Kind,
): dto is Extract<PageContentDTO, { page: PageDTO<Kind> }> {
  return dto.page.kind === kind;
}

export function toPageContent(dto: PageContentDTO): PageContent {
  if (hasKind(dto, 'home')) return { ...shared(dto), kind: PageKind.Home };
  if (hasKind(dto, 'voiceover'))
    return {
      ...shared(dto),
      kind: PageKind.Voiceover,
      roles: dto.roles.map(toContentEntry),
      feature: toFeaturedItem(dto.feature),
    };
  if (hasKind(dto, 'music'))
    return {
      ...shared(dto),
      kind: PageKind.Music,
      feature: toMusicFeature(dto.feature),
      releases: dto.releases.map(toMusicRelease),
    };
  if (hasKind(dto, 'streaming'))
    return {
      ...shared(dto),
      kind: PageKind.Streaming,
      entries: dto.entries.map(toContentEntry),
      clips: dto.clips.map(toStreamClip),
      feature: toFeaturedItem(dto.feature),
    };
  if (hasKind(dto, 'press'))
    return {
      ...shared(dto),
      kind: PageKind.Press,
      entries: dto.entries.map(toContentEntry),
      appearances: dto.appearances.map(toAppearance),
      feature: toFeaturedItem(dto.feature),
    };
  if (hasKind(dto, 'bio'))
    return {
      ...shared(dto),
      kind: PageKind.Bio,
      chapters: dto.chapters.map(toBioChapter),
      currentItems: dto.current_items.map(toCurrentItem),
    };
  throw new Error('Unsupported page aggregate');
}
