import type {
  Page,
  PageId,
  PageMetadataInput,
  PageScope,
} from '../models/Page';
import type { ContentResult } from '../models/ContentResult';
import type { CopyChanges, CopyInput, PageCopy } from '../models/PageCopy';
import type { PageImage, PageImageInput } from '../models/PageImage';
import type { Eyebrow, EyebrowInput } from '../models/Eyebrow';
import type { Trivia, TriviaInput } from '../models/Trivia';
import type { ContentEntry, ContentEntryInput } from '../models/ContentEntry';
import type { MusicRelease, MusicReleaseInput } from '../models/MusicRelease';
import type { StreamClip, StreamClipInput } from '../models/StreamClip';
import type { Appearance, AppearanceInput } from '../models/Appearance';
import type { BioChapter, BioChapterInput } from '../models/BioChapter';
import type { CurrentItem, CurrentItemInput } from '../models/CurrentItem';
import type { PageContentState } from '../models/PageContent';
import type { Readable } from './Readable';
import type { Unsubscribe } from './Unsubscribe';

export interface PageCollectionController<TRecord, TInput extends PageScope> {
  create: (input: Omit<TInput, 'pageId'>) => Promise<ContentResult<TRecord>>;
  update: (
    id: number,
    changes: Partial<Omit<TInput, 'pageId'>>,
  ) => Promise<ContentResult<TRecord>>;
  remove: (id: number) => Promise<ContentResult<void>>;
}

export interface PageController extends Readable<PageContentState> {
  readonly pageId: PageId;
  start: () => Unsubscribe;
  load: () => Promise<void>;
  metadata: (input: PageMetadataInput) => Promise<ContentResult<Page>>;
  copy: {
    create: (
      input: Omit<CopyInput, 'pageId'>,
    ) => Promise<ContentResult<PageCopy>>;
    update: (
      input: Omit<CopyChanges, 'pageId'>,
    ) => Promise<ContentResult<PageCopy>>;
    remove: (key: string) => Promise<ContentResult<void>>;
  };
  image: (
    input: Omit<PageImageInput, 'pageId'>,
  ) => Promise<ContentResult<PageImage>>;
  eyebrows: PageCollectionController<Eyebrow, EyebrowInput>;
  trivia: PageCollectionController<Trivia, TriviaInput>;
  entries: PageCollectionController<ContentEntry, ContentEntryInput>;
  releases: PageCollectionController<MusicRelease, MusicReleaseInput>;
  clips: PageCollectionController<StreamClip, StreamClipInput>;
  appearances: PageCollectionController<Appearance, AppearanceInput>;
  chapters: PageCollectionController<BioChapter, BioChapterInput>;
  currentItems: PageCollectionController<CurrentItem, CurrentItemInput>;
}
