import type { Appearance, AppearanceInput } from '../models/Appearance';
import type { BioChapter, BioChapterInput } from '../models/BioChapter';
import type {
  ContentEntry,
  ContentEntryInput,
  FeaturedItem,
} from '../models/ContentEntry';
import type { ContentResult } from '../models/ContentResult';
import type { CurrentItem, CurrentItemInput } from '../models/CurrentItem';
import type { Eyebrow, EyebrowInput } from '../models/Eyebrow';
import type { MediaAsset, MediaUploadInput } from '../models/MediaAsset';
import type { MusicFeature, MusicFeatureInput } from '../models/MusicFeature';
import type { MusicRelease, MusicReleaseInput } from '../models/MusicRelease';
import type {
  KeyedPageScope,
  Page,
  PageId,
  PageMetadataInput,
  PageScope,
} from '../models/Page';
import type { CollectionOrder } from '../models/PageCollection';
import type { PageContent } from '../models/PageContent';
import type { CopyChanges, CopyInput, PageCopy } from '../models/PageCopy';
import type { PageImage, PageImageInput } from '../models/PageImage';
import type { StreamClip, StreamClipInput } from '../models/StreamClip';
import type { Trivia, TriviaInput } from '../models/Trivia';

export interface OwnedCollectionRepository<TRecord, TInput extends PageScope> {
  create: (input: TInput) => Promise<ContentResult<TRecord>>;
  update: (
    id: number,
    changes: Partial<Omit<TInput, 'pageId'>>,
  ) => Promise<ContentResult<TRecord>>;
  remove: (id: number) => Promise<ContentResult<void>>;
}

export interface ContentRepository {
  site: () => Promise<ContentResult<readonly Page[]>>;
  page: (pageId: PageId) => Promise<ContentResult<PageContent>>;
  metadata: (
    pageId: PageId,
    input: PageMetadataInput,
  ) => Promise<ContentResult<Page>>;
  copy: {
    create: (input: CopyInput) => Promise<ContentResult<PageCopy>>;
    update: (input: CopyChanges) => Promise<ContentResult<PageCopy>>;
    remove: (scope: KeyedPageScope) => Promise<ContentResult<void>>;
  };
  image: (input: PageImageInput) => Promise<ContentResult<PageImage>>;
  eyebrows: OwnedCollectionRepository<Eyebrow, EyebrowInput>;
  trivia: OwnedCollectionRepository<Trivia, TriviaInput>;
  entries: OwnedCollectionRepository<ContentEntry, ContentEntryInput>;
  releases: OwnedCollectionRepository<MusicRelease, MusicReleaseInput>;
  clips: OwnedCollectionRepository<StreamClip, StreamClipInput>;
  appearances: OwnedCollectionRepository<Appearance, AppearanceInput>;
  chapters: OwnedCollectionRepository<BioChapter, BioChapterInput>;
  currentItems: OwnedCollectionRepository<CurrentItem, CurrentItemInput>;
  practice: (input: MusicFeatureInput) => Promise<ContentResult<MusicFeature>>;
  reorder: (input: CollectionOrder) => Promise<ContentResult<CollectionOrder>>;
  feature: (input: FeaturedItem) => Promise<ContentResult<FeaturedItem>>;
  upload: (input: MediaUploadInput) => Promise<ContentResult<MediaAsset>>;
}
