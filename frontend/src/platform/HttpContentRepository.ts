import type {
  ContentRepository,
  OwnedCollectionRepository,
} from '../domain/ports/ContentRepository';
import type { Http } from '../domain/ports/Http';
import type { ContentResult } from '../domain/models/ContentResult';
import type { Method } from '../domain/models/Method';
import type { PageScope } from '../domain/models/Page';
import type { Eyebrow, EyebrowInput } from '../domain/models/Eyebrow';
import type { Trivia, TriviaInput } from '../domain/models/Trivia';
import type {
  ContentEntry,
  ContentEntryInput,
} from '../domain/models/ContentEntry';
import type {
  MusicRelease,
  MusicReleaseInput,
} from '../domain/models/MusicRelease';
import type { StreamClip, StreamClipInput } from '../domain/models/StreamClip';
import type { Appearance, AppearanceInput } from '../domain/models/Appearance';
import type { BioChapter, BioChapterInput } from '../domain/models/BioChapter';
import type {
  CurrentItem,
  CurrentItemInput,
} from '../domain/models/CurrentItem';
import type { EyebrowDTO } from '../application/dto/EyebrowDTO';
import type { TriviaDTO } from '../application/dto/TriviaDTO';
import type { ContentEntryDTO } from '../application/dto/ContentEntryDTO';
import type { MusicReleaseDTO } from '../application/dto/MusicReleaseDTO';
import type { StreamClipDTO } from '../application/dto/StreamClipDTO';
import type { AppearanceDTO } from '../application/dto/AppearanceDTO';
import type { BioChapterDTO } from '../application/dto/BioChapterDTO';
import type { CurrentItemDTO } from '../application/dto/CurrentItemDTO';
import type { PageDTO, SiteDTO } from '../application/dto/PageDTO';
import { toPage } from '../application/mappers/contentPage';
import { toPageContent } from '../application/mappers/contentAggregate';
import { toMediaAsset } from '../application/mappers/contentMedia';
import {
  toContentEntry,
  toFeaturedItem,
} from '../application/mappers/contentEntry';
import {
  toCollectionOrder,
  toAppearance,
  toBioChapter,
  toCurrentItem,
  toStreamClip,
} from '../application/mappers/contentCollections';
import {
  toMusicFeature,
  toMusicRelease,
} from '../application/mappers/contentMusic';
import {
  toEyebrow,
  toPageCopy,
  toPageImage,
  toTrivia,
} from '../application/mappers/contentShared';
import {
  writeCopy,
  writeCopyChanges,
  writeEyebrow,
  writeFeature,
  writeMetadata,
  writeOrder,
  writePageImage,
  writeTrivia,
} from '../application/mappers/writeSharedContent';
import { writeContentEntry } from '../application/mappers/writeContentEntry';
import { writePractice, writeRelease } from '../application/mappers/writeMusic';
import {
  writeAppearance,
  writeChapter,
  writeClip,
  writeCurrentItem,
} from '../application/mappers/writePageCollections';
import { toContentFailure } from '../application/mappers/contentFailure';

/** HTTP/DTO adapter; domain services consume the ContentRepository port. */
export class HttpContentRepository implements ContentRepository {
  readonly eyebrows: ContentRepository['eyebrows'];
  readonly trivia: ContentRepository['trivia'];
  readonly entries: ContentRepository['entries'];
  readonly releases: ContentRepository['releases'];
  readonly clips: ContentRepository['clips'];
  readonly appearances: ContentRepository['appearances'];
  readonly chapters: ContentRepository['chapters'];
  readonly currentItems: ContentRepository['currentItems'];

  constructor(private http: Http) {
    this.eyebrows = this.collection<EyebrowInput, EyebrowDTO, Eyebrow>(
      '/api/v2/pages/eyebrows/',
      writeEyebrow,
      toEyebrow,
    );
    this.trivia = this.collection<TriviaInput, TriviaDTO, Trivia>(
      '/api/v2/pages/trivia/',
      writeTrivia,
      toTrivia,
    );
    this.entries = this.collection<
      ContentEntryInput,
      ContentEntryDTO,
      ContentEntry
    >('/api/v2/content/entries/', writeContentEntry, toContentEntry);
    this.releases = this.collection<
      MusicReleaseInput,
      MusicReleaseDTO,
      MusicRelease
    >('/api/v2/music/releases/', writeRelease, toMusicRelease);
    this.clips = this.collection<StreamClipInput, StreamClipDTO, StreamClip>(
      '/api/v2/streaming/clips/',
      writeClip,
      toStreamClip,
    );
    this.appearances = this.collection<
      AppearanceInput,
      AppearanceDTO,
      Appearance
    >('/api/v2/press/appearances/', writeAppearance, toAppearance);
    this.chapters = this.collection<BioChapterInput, BioChapterDTO, BioChapter>(
      '/api/v2/bio/chapters/',
      writeChapter,
      toBioChapter,
    );
    this.currentItems = this.collection<
      CurrentItemInput,
      CurrentItemDTO,
      CurrentItem
    >('/api/v2/bio/current/', writeCurrentItem, toCurrentItem);
  }

  private send<T>(path: string, method: Method, body: unknown) {
    return this.http
      .request<T>(path, method, body, method !== 'GET', 'content')
      .catch(() => ({ status: null, data: null }));
  }

  private async read<DTO, T>(
    path: string,
    method: Method,
    body: unknown,
    map: (dto: DTO) => T,
  ): Promise<ContentResult<T>> {
    const reply = await this.send<DTO>(path, method, body);
    if (
      reply.status !== null &&
      reply.status >= 200 &&
      reply.status < 300 &&
      reply.data !== null
    ) {
      try {
        return { ok: true, value: map(reply.data) };
      } catch {
        return {
          ok: false,
          error: {
            status: reply.status,
            detail: 'The server returned content we could not read.',
            fields: {},
          },
        };
      }
    }
    return { ok: false, error: toContentFailure(reply.status, reply.data) };
  }

  private async remove(path: string): Promise<ContentResult<void>> {
    const reply = await this.send(path, 'DELETE', undefined);
    return reply.status === 204
      ? { ok: true, value: undefined }
      : { ok: false, error: toContentFailure(reply.status, reply.data) };
  }

  private collection<Input extends PageScope, DTO, T>(
    path: string,
    write: (input: Partial<Omit<Input, 'pageId'>>) => object,
    map: (dto: DTO) => T,
  ): OwnedCollectionRepository<T, Input> {
    return {
      create: (input) =>
        this.read(
          path,
          'POST',
          { page_id: input.pageId, ...write(input) },
          map,
        ),
      update: (id, input) =>
        this.read(`${path}${id}/`, 'PATCH', write(input), map),
      remove: (id) => this.remove(`${path}${id}/`),
    };
  }

  site: ContentRepository['site'] = () =>
    this.read('/api/v2/site/', 'GET', undefined, (dto: SiteDTO) =>
      dto.pages.map(toPage),
    );
  page: ContentRepository['page'] = (pageId) =>
    this.read(`/api/v2/pages/${pageId}/`, 'GET', undefined, toPageContent);
  metadata: ContentRepository['metadata'] = (pageId, input) =>
    this.read(
      `/api/v2/pages/${pageId}/`,
      'PATCH',
      writeMetadata(input),
      (dto: PageDTO) => toPage(dto),
    );
  readonly copy: ContentRepository['copy'] = {
    create: (input) =>
      this.read('/api/v2/pages/copy/', 'POST', writeCopy(input), toPageCopy),
    update: (input) =>
      this.read(
        '/api/v2/pages/copy/',
        'PATCH',
        writeCopyChanges(input),
        toPageCopy,
      ),
    remove: ({ pageId, key }) =>
      this.remove(
        `/api/v2/pages/copy/?${new URLSearchParams({ page_id: String(pageId), key })}`,
      ),
  };
  image: ContentRepository['image'] = (input) =>
    this.read(
      '/api/v2/pages/images/',
      'PATCH',
      writePageImage(input),
      toPageImage,
    );
  practice: ContentRepository['practice'] = (input) =>
    this.read(
      '/api/v2/music/features/',
      'PATCH',
      writePractice(input),
      toMusicFeature,
    );
  reorder: ContentRepository['reorder'] = (input) =>
    this.read(
      '/api/v2/collections/reorder/',
      'PATCH',
      writeOrder(input),
      toCollectionOrder,
    );
  feature: ContentRepository['feature'] = (input) =>
    this.read(
      '/api/v2/content/features/',
      'PATCH',
      writeFeature(input),
      toFeaturedItem,
    );
  upload: ContentRepository['upload'] = (input) => {
    const body = new FormData();
    body.append('file', input.file);
    body.append('credit', input.credit);
    body.append('source_url', input.sourceUrl);
    return this.read('/api/v2/media/assets/', 'POST', body, toMediaAsset);
  };
}
