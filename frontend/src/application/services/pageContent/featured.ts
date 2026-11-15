import type {
  ContentEntry,
  FeaturedItem,
} from '../../../domain/models/ContentEntry';
import type { MusicFeature } from '../../../domain/models/MusicFeature';
import { PageKind } from '../../../domain/models/Page';
import type {
  PageContent,
  PressContent,
  StreamingContent,
  VoiceoverContent,
} from '../../../domain/models/PageContent';
import { upsertRecord, withoutRecord } from './shared';

function isFeaturedPage(
  content: PageContent,
): content is VoiceoverContent | StreamingContent | PressContent {
  return (
    content.kind === PageKind.Voiceover ||
    content.kind === PageKind.Streaming ||
    content.kind === PageKind.Press
  );
}

export function withEntry(
  content: PageContent,
  entry: ContentEntry,
): PageContent {
  if (
    !isFeaturedPage(content) ||
    entry.pageId !== content.page.id ||
    (entry.isFeatured && entry.image === null)
  )
    return content;
  const rows =
    content.kind === PageKind.Voiceover ? content.roles : content.entries;
  const updated = upsertRecord(rows, entry);
  const next =
    content.kind === PageKind.Voiceover
      ? { ...content, roles: updated }
      : { ...content, entries: updated };
  if (entry.isFeatured)
    return withFeaturedItem(next, {
      pageId: content.page.id,
      itemId: entry.id,
    });
  return next.feature.itemId === entry.id
    ? withFeaturedItem(next, { pageId: content.page.id, itemId: null })
    : next;
}

export function withFeaturedItem(
  content: PageContent,
  feature: FeaturedItem,
): PageContent {
  if (!isFeaturedPage(content) || feature.pageId !== content.page.id)
    return content;
  const rows =
    content.kind === PageKind.Voiceover ? content.roles : content.entries;
  if (
    feature.itemId !== null &&
    !rows.some((entry) => entry.id === feature.itemId && entry.image !== null)
  )
    return content;
  const entries = rows.map((entry): ContentEntry => ({
    ...entry,
    isFeatured: entry.id === feature.itemId,
  }));
  return content.kind === PageKind.Voiceover
    ? { ...content, roles: entries, feature }
    : { ...content, entries, feature };
}

export function withoutEntry(content: PageContent, id: number): PageContent {
  if (!isFeaturedPage(content)) return content;
  const rows =
    content.kind === PageKind.Voiceover ? content.roles : content.entries;
  if (!rows.some((row) => row.id === id)) return content;
  const remaining = withoutRecord(rows, id);
  const feature =
    content.feature.itemId === id
      ? { pageId: content.page.id, itemId: null }
      : content.feature;
  return content.kind === PageKind.Voiceover
    ? { ...content, roles: remaining, feature }
    : { ...content, entries: remaining, feature };
}

export function withPractice(
  content: PageContent,
  feature: MusicFeature,
): PageContent {
  return content.kind === PageKind.Music && feature.pageId === content.page.id
    ? { ...content, feature }
    : content;
}
