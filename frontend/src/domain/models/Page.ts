import type { Link, LinkInput } from './Link';

export enum PageKind {
  Home = 'home',
  Voiceover = 'voiceover',
  Music = 'music',
  Streaming = 'streaming',
  Press = 'press',
  Bio = 'bio',
}

export type PageId = number;

export interface Page<Kind extends PageKind = PageKind> {
  readonly id: PageId;
  readonly kind: Kind;
  readonly title: string;
  readonly slug: string;
  readonly primaryAction: Link | null;
}

export interface PageScope {
  readonly pageId: PageId;
}
export interface KeyedPageScope extends PageScope {
  readonly key: string;
}
export interface OrderedPageRecord extends PageScope {
  readonly id: number;
  readonly sortOrder: number;
}

export interface PageMetadataInput {
  readonly title?: string;
  readonly slug?: string;
  readonly primaryAction?: LinkInput | null;
}

export const NAVIGATION_KINDS = [
  PageKind.Voiceover,
  PageKind.Music,
  PageKind.Streaming,
  PageKind.Press,
  PageKind.Bio,
] as const;
export const EXPLORE_KINDS = [
  PageKind.Voiceover,
  PageKind.Music,
  PageKind.Streaming,
  PageKind.Press,
] as const;
