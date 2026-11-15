import type { Appearance } from '../../../domain/models/Appearance';
import type { BioChapter } from '../../../domain/models/BioChapter';
import type { ContentEntry } from '../../../domain/models/ContentEntry';
import type { CurrentItem } from '../../../domain/models/CurrentItem';
import type { Eyebrow } from '../../../domain/models/Eyebrow';
import type { MusicRelease } from '../../../domain/models/MusicRelease';
import type { OrderedPageRecord } from '../../../domain/models/Page';
import { PageKind } from '../../../domain/models/Page';
import { PageCollection } from '../../../domain/models/PageCollection';
import type { PageContent } from '../../../domain/models/PageContent';
import type { StreamClip } from '../../../domain/models/StreamClip';
import type { Trivia } from '../../../domain/models/Trivia';

export interface CollectionPolicy<T extends OrderedPageRecord> {
  readonly kind: PageCollection;
  rows: (content: PageContent) => readonly T[] | null;
  replace: (content: PageContent, rows: readonly T[]) => PageContent;
}

export const eyebrowPolicy: CollectionPolicy<Eyebrow> = {
  kind: PageCollection.Eyebrows,
  rows: (content) => content.eyebrows,
  replace: (content, rows) => ({ ...content, eyebrows: rows }),
};
export const triviaPolicy: CollectionPolicy<Trivia> = {
  kind: PageCollection.Trivia,
  rows: (content) => content.trivia,
  replace: (content, rows) => ({ ...content, trivia: rows }),
};
export const entryPolicy: CollectionPolicy<ContentEntry> = {
  kind: PageCollection.ContentEntries,
  rows: (content) => {
    switch (content.kind) {
      case PageKind.Voiceover:
        return content.roles;
      case PageKind.Streaming:
      case PageKind.Press:
        return content.entries;
      default:
        return null;
    }
  },
  replace: (content, rows) => {
    switch (content.kind) {
      case PageKind.Voiceover:
        return { ...content, roles: rows };
      case PageKind.Streaming:
      case PageKind.Press:
        return { ...content, entries: rows };
      default:
        return content;
    }
  },
};
export const releasePolicy: CollectionPolicy<MusicRelease> = {
  kind: PageCollection.Releases,
  rows: (content) =>
    content.kind === PageKind.Music ? content.releases : null,
  replace: (content, rows) =>
    content.kind === PageKind.Music ? { ...content, releases: rows } : content,
};
export const clipPolicy: CollectionPolicy<StreamClip> = {
  kind: PageCollection.StreamClips,
  rows: (content) =>
    content.kind === PageKind.Streaming ? content.clips : null,
  replace: (content, rows) =>
    content.kind === PageKind.Streaming ? { ...content, clips: rows } : content,
};
export const appearancePolicy: CollectionPolicy<Appearance> = {
  kind: PageCollection.Appearances,
  rows: (content) =>
    content.kind === PageKind.Press ? content.appearances : null,
  replace: (content, rows) =>
    content.kind === PageKind.Press
      ? { ...content, appearances: rows }
      : content,
};
export const chapterPolicy: CollectionPolicy<BioChapter> = {
  kind: PageCollection.BioChapters,
  rows: (content) => (content.kind === PageKind.Bio ? content.chapters : null),
  replace: (content, rows) =>
    content.kind === PageKind.Bio ? { ...content, chapters: rows } : content,
};
export const currentPolicy: CollectionPolicy<CurrentItem> = {
  kind: PageCollection.CurrentItems,
  rows: (content) =>
    content.kind === PageKind.Bio ? content.currentItems : null,
  replace: (content, rows) =>
    content.kind === PageKind.Bio
      ? { ...content, currentItems: rows }
      : content,
};
