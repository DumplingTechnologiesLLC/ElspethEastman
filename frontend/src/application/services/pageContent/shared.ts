import type { OrderedPageRecord, Page } from '../../../domain/models/Page';
import type { PageContent } from '../../../domain/models/PageContent';
import type { PageCopy } from '../../../domain/models/PageCopy';
import type { PageImage } from '../../../domain/models/PageImage';

export function upsertRecord<T extends OrderedPageRecord>(
  rows: readonly T[],
  value: T,
): readonly T[] {
  // oxlint-disable-next-line unicorn/no-array-sort -- Sort this newly allocated array under the ES2022 runtime target.
  return [...rows.filter((row) => row.id !== value.id), value].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  );
}
export function withoutRecord<T extends OrderedPageRecord>(
  rows: readonly T[],
  id: number,
): readonly T[] {
  return rows.filter((row) => row.id !== id);
}

export function withMetadata<T extends PageContent>(content: T, page: Page): T {
  if (content.page.id !== page.id || content.kind !== page.kind) return content;
  return { ...content, page: { ...page, kind: content.kind } };
}
export function withCopy<T extends PageContent>(
  content: T,
  block: PageCopy,
): T {
  if (block.pageId !== content.page.id) return content;
  const byId = content.copy.find((row) => row.id === block.id);
  const byKey = content.copy.find((row) => row.key === block.key);
  if (
    byId !== undefined &&
    (byId.key !== block.key || byId.section !== block.section)
  )
    return content;
  if (byKey !== undefined && byKey.id !== block.id) return content;
  return { ...content, copy: upsertRecord(content.copy, block) };
}
export function withoutCopy<T extends PageContent>(content: T, key: string): T {
  return content.copy.some((row) => row.key === key)
    ? { ...content, copy: content.copy.filter((row) => row.key !== key) }
    : content;
}
export function withPageImage<T extends PageContent>(
  content: T,
  value: PageImage,
): T {
  if (
    value.pageId !== content.page.id ||
    !content.images.some((image) => image.key === value.key)
  )
    return content;
  return {
    ...content,
    images: content.images.map((image) =>
      image.key === value.key ? value : image,
    ),
  };
}
