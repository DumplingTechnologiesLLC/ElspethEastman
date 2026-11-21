import type {
  ContentRepository,
  OwnedCollectionRepository,
} from '../../domain/ports/ContentRepository';
import type {
  PageCollectionController,
  PageController,
} from '../../domain/ports/PageController';
import type { Session } from '../../domain/ports/Session';
import type { SiteController } from '../../domain/ports/SiteController';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { ContentResult } from '../../domain/models/ContentResult';
import { rejectContent } from '../../domain/models/ContentResult';
import type {
  OrderedPageRecord,
  PageId,
  PageScope,
} from '../../domain/models/Page';
import type { Eyebrow, EyebrowInput } from '../../domain/models/Eyebrow';
import type { Trivia, TriviaInput } from '../../domain/models/Trivia';
import type {
  ContentEntry,
  ContentEntryInput,
} from '../../domain/models/ContentEntry';
import type {
  MusicRelease,
  MusicReleaseInput,
} from '../../domain/models/MusicRelease';
import type {
  StreamClip,
  StreamClipInput,
} from '../../domain/models/StreamClip';
import type {
  Appearance,
  AppearanceInput,
} from '../../domain/models/Appearance';
import type {
  BioChapter,
  BioChapterInput,
} from '../../domain/models/BioChapter';
import type {
  CurrentItem,
  CurrentItemInput,
} from '../../domain/models/CurrentItem';
import { PAGE_COLLECTIONS } from '../../domain/models/PageCollection';
import type {
  PageContent,
  PageContentState,
} from '../../domain/models/PageContent';
import { Store } from './Store';
import { reportContentFailure } from '../alerts/reportContentFailure';
import {
  appearancePolicy,
  chapterPolicy,
  clipPolicy,
  currentPolicy,
  entryPolicy,
  eyebrowPolicy,
  releasePolicy,
  triviaPolicy,
} from './pageContent/collections';
import type { CollectionPolicy } from './pageContent/collections';
import {
  withCopy,
  withoutCopy,
  withMetadata,
  withPageImage,
  upsertRecord,
  withoutRecord,
} from './pageContent/shared';
import {
  withEntry,
  withoutEntry,
  withFeaturedItem,
  withPractice,
} from './pageContent/featured';
import { collectionIds, withCollectionOrder } from './pageContent/order';
import { PageKind } from '../../domain/models/Page';

interface MutationOptions<T> {
  readonly after?: (value: T) => void;
  readonly validation?: 'inline' | 'toast';
}
export class PageService
  extends Store<PageContentState>
  implements PageController
{
  private content: PageContent | null = null;
  private pending: Promise<ContentResult<PageContent>> | undefined;
  private version = 0;
  private consumers = 0;
  readonly eyebrows: PageController['eyebrows'];
  readonly trivia: PageController['trivia'];
  readonly entries: PageController['entries'];
  readonly releases: PageController['releases'];
  readonly clips: PageController['clips'];
  readonly appearances: PageController['appearances'];
  readonly chapters: PageController['chapters'];
  readonly currentItems: PageController['currentItems'];

  constructor(
    readonly pageId: PageId,
    private repository: ContentRepository,
    private alerts: UIAlerts,
    private site: Pick<SiteController, 'updatePage' | 'getSnapshot' | 'select'>,
    private session: Pick<Session, 'getSnapshot' | 'expire'>,
  ) {
    super({
      pageId,
      content: null,
      status: 'idle',
      error: null,
      mutating: false,
    });
    this.eyebrows = this.collection<Eyebrow, EyebrowInput>(
      repository.eyebrows,
      eyebrowPolicy,
      (input) => ({ ...input, pageId }),
    );
    this.trivia = this.collection<Trivia, TriviaInput>(
      repository.trivia,
      triviaPolicy,
      (input) => ({ ...input, pageId }),
    );
    this.entries = this.collection<ContentEntry, ContentEntryInput>(
      repository.entries,
      entryPolicy,
      (input) => ({ ...input, pageId }),
      withEntry,
      withoutEntry,
      (id) => {
        const route = this.site.getSnapshot().route;
        if (
          route.type === 'page' &&
          route.page.id === this.pageId &&
          route.selectedId === id
        )
          this.site.select(null);
      },
    );
    this.releases = this.collection<MusicRelease, MusicReleaseInput>(
      repository.releases,
      releasePolicy,
      (input) => ({ ...input, pageId }),
    );
    this.clips = this.collection<StreamClip, StreamClipInput>(
      repository.clips,
      clipPolicy,
      (input) => ({ ...input, pageId }),
    );
    this.appearances = this.collection<Appearance, AppearanceInput>(
      repository.appearances,
      appearancePolicy,
      (input) => ({ ...input, pageId }),
    );
    this.chapters = this.collection<BioChapter, BioChapterInput>(
      repository.chapters,
      chapterPolicy,
      (input) => ({ ...input, pageId }),
    );
    this.currentItems = this.collection<CurrentItem, CurrentItemInput>(
      repository.currentItems,
      currentPolicy,
      (input) => ({ ...input, pageId }),
    );
  }
  start = () => {
    this.consumers++;
    if (this.consumers === 1) void this.load();
    return () => {
      this.consumers--;
      if (this.consumers === 0) this.version++;
    };
  };
  load = async () => {
    const version = ++this.version;
    if (this.content !== null) {
      this.patch({ content: this.content, status: 'ready', error: null });
      return;
    }
    this.patch({ status: 'loading', error: null });
    this.pending ??= this.repository
      .page(this.pageId)
      .catch((): ContentResult<PageContent> => ({
        ok: false,
        error: {
          status: null,
          detail: 'Could not load this page. Please try again.',
          fields: {},
        },
      }));
    let result = await this.pending;
    this.pending = undefined;
    if (result.ok && result.value.page.id !== this.pageId)
      result = {
        ok: false,
        error: {
          status: null,
          detail: 'Could not load this page. Please try again.',
          fields: {},
        },
      };
    if (result.ok) this.content = result.value;
    if (version !== this.version) return;
    if (!result.ok) {
      this.patch({ status: 'error', error: result.error });
      if (result.error.status === 403) {
        this.session.expire(this.session.getSnapshot().path);
        return;
      }
      this.alerts.show({
        title: 'Could not load the page',
        content: result.error.detail,
        flavor: 'error',
      });
      return;
    }
    this.patch({ content: result.value, status: 'ready' });
  };

  private async mutate<T>(
    request: () => Promise<ContentResult<T>>,
    reconcile: (content: PageContent, value: T) => PageContent,
    allow: (content: PageContent) => boolean = () => true,
    options: MutationOptions<T> = {},
  ): Promise<ContentResult<T>> {
    const content = this.content;
    if (content === null)
      return rejectContent('Wait for the page to finish loading.');
    if (this.getSnapshot().mutating)
      return rejectContent('An update is already in progress.');
    if (!allow(content))
      return rejectContent(
        'This item is not available on this page. Refresh the page and try again.',
      );
    const returnTo = this.session.getSnapshot().path;
    this.patch({ mutating: true });
    let result: ContentResult<T>;
    try {
      result = await request();
      if (result.ok) {
        const next = reconcile(content, result.value);
        if (next === content)
          result = rejectContent(
            'Could not apply the update. Refresh this page and try again.',
          );
        else {
          this.content = next;
          this.patch({ content: next, error: null });
          options.after?.(result.value);
        }
      }
    } catch {
      result = rejectContent('Could not save changes. Please try again.');
    } finally {
      this.patch({ mutating: false });
    }
    if (!result.ok)
      reportContentFailure(
        result.error,
        this.alerts,
        this.session,
        returnTo,
        options.validation === 'toast',
      );
    return result;
  }

  private collection<T extends OrderedPageRecord, Input extends PageScope>(
    source: OwnedCollectionRepository<T, Input>,
    policy: CollectionPolicy<T>,
    own: (input: Omit<Input, 'pageId'>) => Input,
    upsert: (content: PageContent, value: T) => PageContent = (
      content,
      value,
    ) =>
      value.pageId === this.pageId
        ? policy.replace(content, upsertRecord(policy.rows(content)!, value))
        : content,
    remove: (content: PageContent, id: number) => PageContent = (content, id) =>
      policy.replace(content, withoutRecord(policy.rows(content)!, id)),
    afterRemove?: (id: number) => void,
  ): PageCollectionController<T, Input> {
    const allowed = (content: PageContent) =>
      policy.rows(content) !== null &&
      PAGE_COLLECTIONS[content.kind].includes(policy.kind);
    const member = (content: PageContent, id: number) => {
      const rows = policy.rows(content);
      return (
        rows !== null &&
        PAGE_COLLECTIONS[content.kind].includes(policy.kind) &&
        rows.some((row) => row.id === id)
      );
    };
    return {
      create: (input) =>
        this.mutate(() => source.create(own(input)), upsert, allowed),
      update: (id, input) =>
        this.mutate(
          () => source.update(id, input),
          (content, value) =>
            value.id === id ? upsert(content, value) : content,
          (content) => member(content, id),
        ),
      remove: (id) =>
        this.mutate(
          () => source.remove(id),
          (content) => remove(content, id),
          (content) => member(content, id),
          { after: () => afterRemove?.(id) },
        ),
    };
  }

  metadata: PageController['metadata'] = (input) =>
    this.mutate(
      () => this.repository.metadata(this.pageId, input),
      withMetadata,
      undefined,
      { after: (page) => this.site.updatePage(page) },
    );
  readonly copy: PageController['copy'] = {
    create: (input) =>
      this.mutate(
        () => this.repository.copy.create({ ...input, pageId: this.pageId }),
        (content, value) =>
          value.key === input.key ? withCopy(content, value) : content,
      ),
    update: (input) =>
      this.mutate(
        () => this.repository.copy.update({ ...input, pageId: this.pageId }),
        (content, value) =>
          value.key === input.key ? withCopy(content, value) : content,
        (content) => content.copy.some((row) => row.key === input.key),
      ),
    remove: (key) =>
      this.mutate(
        () => this.repository.copy.remove({ pageId: this.pageId, key }),
        (content) => withoutCopy(content, key),
        (content) => content.copy.some((row) => row.key === key),
      ),
  };
  image: PageController['image'] = (input) =>
    this.mutate(
      () => this.repository.image({ ...input, pageId: this.pageId }),
      (content, value) =>
        value.key === input.key ? withPageImage(content, value) : content,
      (content) => content.images.some((image) => image.key === input.key),
    );

  practice: PageController['practice'] = (input) =>
    this.mutate(
      () => this.repository.practice({ ...input, pageId: this.pageId }),
      withPractice,
      (content) => content.kind === PageKind.Music,
    );
  feature: PageController['feature'] = (itemId) => {
    const input = { pageId: this.pageId, itemId };
    return this.mutate(
      () => this.repository.feature(input),
      withFeaturedItem,
      (content) => withFeaturedItem(content, input) !== content,
      { validation: 'toast' },
    );
  };
  reorder: PageController['reorder'] = (input) => {
    const scoped = { ...input, pageId: this.pageId };
    return this.mutate(
      () => this.repository.reorder(scoped),
      (content, value) =>
        value.collection === input.collection && value.section === input.section
          ? withCollectionOrder(content, value)
          : content,
      (content) => withCollectionOrder(content, scoped) !== content,
      { validation: 'toast' },
    );
  };
  move: PageController['move'] = (input) => {
    const content = this.content;
    const ids = content === null ? null : collectionIds(content, input);
    if (
      ids === null ||
      !ids.includes(input.itemId) ||
      input.itemId === input.beforeId ||
      (input.beforeId !== null && !ids.includes(input.beforeId))
    )
      return Promise.resolve(
        rejectContent(
          'This position is not available. Refresh the page and try again.',
        ),
      );
    const orderedIds = ids.filter((id) => id !== input.itemId);
    const index =
      input.beforeId === null
        ? orderedIds.length
        : orderedIds.indexOf(input.beforeId);
    orderedIds.splice(index, 0, input.itemId);
    return this.reorder({
      collection: input.collection,
      section: input.section,
      orderedIds,
    });
  };
}
