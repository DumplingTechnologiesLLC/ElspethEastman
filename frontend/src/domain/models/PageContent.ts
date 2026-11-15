import type { Appearance } from './Appearance';
import type { BioChapter } from './BioChapter';
import type { ContentEntry, FeaturedItem } from './ContentEntry';
import type { CurrentItem } from './CurrentItem';
import type { Eyebrow } from './Eyebrow';
import type { MusicFeature } from './MusicFeature';
import type { MusicRelease } from './MusicRelease';
import type { Page, PageKind } from './Page';
import type { PageCopy } from './PageCopy';
import type { PageImage } from './PageImage';
import type { StreamClip } from './StreamClip';
import type { Trivia } from './Trivia';

export interface SharedPageContent<Kind extends PageKind = PageKind> {
  readonly page: Page<Kind>;
  readonly copy: readonly PageCopy[];
  readonly images: readonly PageImage[];
  readonly eyebrows: readonly Eyebrow[];
  readonly trivia: readonly Trivia[];
}
export interface HomeContent extends SharedPageContent<PageKind.Home> {
  readonly kind: PageKind.Home;
}
export interface VoiceoverContent extends SharedPageContent<PageKind.Voiceover> {
  readonly kind: PageKind.Voiceover;
  readonly roles: readonly ContentEntry[];
  readonly feature: FeaturedItem;
}
export interface MusicContent extends SharedPageContent<PageKind.Music> {
  readonly kind: PageKind.Music;
  readonly feature: MusicFeature;
  readonly releases: readonly MusicRelease[];
}
export interface StreamingContent extends SharedPageContent<PageKind.Streaming> {
  readonly kind: PageKind.Streaming;
  readonly entries: readonly ContentEntry[];
  readonly clips: readonly StreamClip[];
  readonly feature: FeaturedItem;
}
export interface PressContent extends SharedPageContent<PageKind.Press> {
  readonly kind: PageKind.Press;
  readonly entries: readonly ContentEntry[];
  readonly appearances: readonly Appearance[];
  readonly feature: FeaturedItem;
}
export interface BioContent extends SharedPageContent<PageKind.Bio> {
  readonly kind: PageKind.Bio;
  readonly chapters: readonly BioChapter[];
  readonly currentItems: readonly CurrentItem[];
}
export type PageContent =
  | HomeContent
  | VoiceoverContent
  | MusicContent
  | StreamingContent
  | PressContent
  | BioContent;
