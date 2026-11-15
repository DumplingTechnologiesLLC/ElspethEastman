import { vi } from 'vitest';
import type {
  ContentRepository,
  OwnedCollectionRepository,
} from '../frontend/src/domain/ports/ContentRepository';
import type { PageScope } from '../frontend/src/domain/models/Page';
import type {
  Eyebrow,
  EyebrowInput,
} from '../frontend/src/domain/models/Eyebrow';
import type { Trivia, TriviaInput } from '../frontend/src/domain/models/Trivia';
import type {
  ContentEntry,
  ContentEntryInput,
} from '../frontend/src/domain/models/ContentEntry';
import type {
  MusicRelease,
  MusicReleaseInput,
} from '../frontend/src/domain/models/MusicRelease';
import type {
  StreamClip,
  StreamClipInput,
} from '../frontend/src/domain/models/StreamClip';
import type {
  Appearance,
  AppearanceInput,
} from '../frontend/src/domain/models/Appearance';
import type {
  BioChapter,
  BioChapterInput,
} from '../frontend/src/domain/models/BioChapter';
import type {
  CurrentItem,
  CurrentItemInput,
} from '../frontend/src/domain/models/CurrentItem';

const noReply = new Error('No content reply queued');
function collection<TRecord, TInput extends PageScope>() {
  return {
    create: vi
      .fn<OwnedCollectionRepository<TRecord, TInput>['create']>()
      .mockRejectedValue(noReply),
    update: vi
      .fn<OwnedCollectionRepository<TRecord, TInput>['update']>()
      .mockRejectedValue(noReply),
    remove: vi
      .fn<OwnedCollectionRepository<TRecord, TInput>['remove']>()
      .mockRejectedValue(noReply),
  };
}
export type MockCollection<TRecord, TInput extends PageScope> = ReturnType<
  typeof collection<TRecord, TInput>
>;
export function mockContentRepository() {
  return {
    site: vi.fn<ContentRepository['site']>().mockRejectedValue(noReply),
    page: vi.fn<ContentRepository['page']>().mockRejectedValue(noReply),
    metadata: vi.fn<ContentRepository['metadata']>().mockRejectedValue(noReply),
    copy: {
      create: vi
        .fn<ContentRepository['copy']['create']>()
        .mockRejectedValue(noReply),
      update: vi
        .fn<ContentRepository['copy']['update']>()
        .mockRejectedValue(noReply),
      remove: vi
        .fn<ContentRepository['copy']['remove']>()
        .mockRejectedValue(noReply),
    },
    image: vi.fn<ContentRepository['image']>().mockRejectedValue(noReply),
    eyebrows: collection<Eyebrow, EyebrowInput>(),
    trivia: collection<Trivia, TriviaInput>(),
    entries: collection<ContentEntry, ContentEntryInput>(),
    releases: collection<MusicRelease, MusicReleaseInput>(),
    clips: collection<StreamClip, StreamClipInput>(),
    appearances: collection<Appearance, AppearanceInput>(),
    chapters: collection<BioChapter, BioChapterInput>(),
    currentItems: collection<CurrentItem, CurrentItemInput>(),
    practice: vi.fn<ContentRepository['practice']>().mockRejectedValue(noReply),
    reorder: vi.fn<ContentRepository['reorder']>().mockRejectedValue(noReply),
    feature: vi.fn<ContentRepository['feature']>().mockRejectedValue(noReply),
    upload: vi.fn<ContentRepository['upload']>().mockRejectedValue(noReply),
  } satisfies ContentRepository;
}
