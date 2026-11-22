import {
  PageCollection,
  PAGE_COLLECTIONS,
} from '../../../domain/models/PageCollection';
import type { CollectionOrder } from '../../../domain/models/PageCollection';
import { COPY_SECTIONS } from '../../../domain/models/PageCopy';
import type { OrderedPageRecord } from '../../../domain/models/Page';
import type { PageContent } from '../../../domain/models/PageContent';
import type { CollectionPolicy } from './collections';
import {
  appearancePolicy,
  chapterPolicy,
  clipPolicy,
  currentPolicy,
  entryPolicy,
  eyebrowPolicy,
  releasePolicy,
  triviaPolicy,
} from './collections';

const readers = {
  [PageCollection.Eyebrows]: eyebrowPolicy.rows,
  [PageCollection.Trivia]: triviaPolicy.rows,
  [PageCollection.ContentEntries]: entryPolicy.rows,
  [PageCollection.Releases]: releasePolicy.rows,
  [PageCollection.StreamClips]: clipPolicy.rows,
  [PageCollection.Appearances]: appearancePolicy.rows,
  [PageCollection.BioChapters]: chapterPolicy.rows,
  [PageCollection.CurrentItems]: currentPolicy.rows,
};
export function collectionIds(
  content: PageContent,
  scope: Pick<CollectionOrder, 'collection' | 'section'>,
): readonly string[] | null {
  if (!PAGE_COLLECTIONS[content.kind].includes(scope.collection)) return null;
  if (scope.collection === PageCollection.Copy) {
    if (
      scope.section === null ||
      !COPY_SECTIONS[content.kind].includes(scope.section)
    )
      return null;
    return content.copy
      .filter((row) => row.section === scope.section)
      .map((row) => row.id);
  }
  if (scope.section !== null) return null;
  return readers[scope.collection](content)!.map((row) => row.id);
}

function ordered<T extends OrderedPageRecord>(
  rows: readonly T[],
  ids: readonly string[],
): readonly T[] | null {
  const members = new Map(rows.map((row) => [row.id, row]));
  if (
    ids.length !== members.size ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !members.has(id))
  )
    return null;
  // Every ID was checked against this local map before constructing the result.
  return ids.map((id, sortOrder) => ({ ...members.get(id)!, sortOrder }));
}

export function orderCollection<T extends OrderedPageRecord>(
  policy: CollectionPolicy<T>,
  content: PageContent,
  input: CollectionOrder,
): PageContent {
  if (input.pageId !== content.page.id || input.collection !== policy.kind)
    return content;
  const rows = policy.rows(content);
  if (rows === null || input.section !== null) return content;
  const reordered = ordered(rows, input.orderedIds);
  return reordered === null ? content : policy.replace(content, reordered);
}

function orderCopy(content: PageContent, input: CollectionOrder): PageContent {
  if (
    input.section === null ||
    !COPY_SECTIONS[content.kind].includes(input.section)
  )
    return content;
  const rows = content.copy.filter((row) => row.section === input.section);
  const reordered = ordered(rows, input.orderedIds);
  if (reordered === null) return content;
  return {
    ...content,
    copy: [
      ...content.copy.filter((row) => row.section !== input.section),
      ...reordered,
    ],
  };
}

const reorderers: Readonly<
  Record<
    PageCollection,
    (content: PageContent, input: CollectionOrder) => PageContent
  >
> = {
  [PageCollection.Copy]: orderCopy,
  [PageCollection.Eyebrows]: (content, input) =>
    orderCollection(eyebrowPolicy, content, input),
  [PageCollection.Trivia]: (content, input) =>
    orderCollection(triviaPolicy, content, input),
  [PageCollection.ContentEntries]: (content, input) =>
    orderCollection(entryPolicy, content, input),
  [PageCollection.Releases]: (content, input) =>
    orderCollection(releasePolicy, content, input),
  [PageCollection.StreamClips]: (content, input) =>
    orderCollection(clipPolicy, content, input),
  [PageCollection.Appearances]: (content, input) =>
    orderCollection(appearancePolicy, content, input),
  [PageCollection.BioChapters]: (content, input) =>
    orderCollection(chapterPolicy, content, input),
  [PageCollection.CurrentItems]: (content, input) =>
    orderCollection(currentPolicy, content, input),
};

export function withCollectionOrder(
  content: PageContent,
  input: CollectionOrder,
): PageContent {
  if (
    input.pageId !== content.page.id ||
    !PAGE_COLLECTIONS[content.kind].includes(input.collection)
  )
    return content;
  return reorderers[input.collection](content, input);
}
