import type { AppearanceDTO } from './AppearanceDTO';
import type { BioChapterDTO } from './BioChapterDTO';
import type { ContentEntryDTO, FeaturedItemDTO } from './ContentEntryDTO';
import type { CurrentItemDTO } from './CurrentItemDTO';
import type { EyebrowDTO } from './EyebrowDTO';
import type { MusicFeatureDTO } from './MusicFeatureDTO';
import type { MusicReleaseDTO } from './MusicReleaseDTO';
import type { PageDTO, PageKindDTO } from './PageDTO';
import type { PageCopyDTO } from './PageCopyDTO';
import type { PageImageDTO } from './PageImageDTO';
import type { StreamClipDTO } from './StreamClipDTO';
import type { TriviaDTO } from './TriviaDTO';

export interface SharedPageContentDTO<Kind extends PageKindDTO = PageKindDTO> {
  page: PageDTO<Kind>;
  copy: PageCopyDTO[];
  images: PageImageDTO[];
  eyebrows: EyebrowDTO[];
  trivia: TriviaDTO[];
}
export interface HomeContentDTO extends SharedPageContentDTO<'home'> {}
export interface VoiceoverContentDTO extends SharedPageContentDTO<'voiceover'> {
  roles: ContentEntryDTO[];
  feature: FeaturedItemDTO;
}
export interface MusicContentDTO extends SharedPageContentDTO<'music'> {
  feature: MusicFeatureDTO;
  releases: MusicReleaseDTO[];
}
export interface StreamingContentDTO extends SharedPageContentDTO<'streaming'> {
  entries: ContentEntryDTO[];
  clips: StreamClipDTO[];
  feature: FeaturedItemDTO;
}
export interface PressContentDTO extends SharedPageContentDTO<'press'> {
  entries: ContentEntryDTO[];
  appearances: AppearanceDTO[];
  feature: FeaturedItemDTO;
}
export interface BioContentDTO extends SharedPageContentDTO<'bio'> {
  chapters: BioChapterDTO[];
  current_items: CurrentItemDTO[];
}
export type PageContentDTO =
  | HomeContentDTO
  | VoiceoverContentDTO
  | MusicContentDTO
  | StreamingContentDTO
  | PressContentDTO
  | BioContentDTO;
