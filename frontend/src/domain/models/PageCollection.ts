import type { PageScope } from './Page';
import { PageKind } from './Page';

export enum PageCollection {
  Copy = 'copy',
  Eyebrows = 'eyebrows',
  Trivia = 'trivia',
  ContentEntries = 'content_entries',
  Releases = 'releases',
  StreamClips = 'stream_clips',
  Appearances = 'appearances',
  BioChapters = 'bio_chapters',
  CurrentItems = 'current_items',
}

const shared = [
  PageCollection.Copy,
  PageCollection.Eyebrows,
  PageCollection.Trivia,
];
export const PAGE_COLLECTIONS: Readonly<
  Record<PageKind, readonly PageCollection[]>
> = {
  [PageKind.Home]: [PageCollection.Copy, PageCollection.Eyebrows],
  [PageKind.Voiceover]: [...shared, PageCollection.ContentEntries],
  [PageKind.Music]: [...shared, PageCollection.Releases],
  [PageKind.Streaming]: [
    ...shared,
    PageCollection.ContentEntries,
    PageCollection.StreamClips,
  ],
  [PageKind.Press]: [
    ...shared,
    PageCollection.ContentEntries,
    PageCollection.Appearances,
  ],
  [PageKind.Bio]: [
    ...shared,
    PageCollection.BioChapters,
    PageCollection.CurrentItems,
  ],
};
export interface CollectionOrder extends PageScope {
  readonly collection: PageCollection;
  readonly section: string | null;
  readonly orderedIds: readonly number[];
}
