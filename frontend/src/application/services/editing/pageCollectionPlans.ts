import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import { PageKind } from '../../../domain/models/Page';
import type { PageContent } from '../../../domain/models/PageContent';
import type { PageController } from '../../../domain/ports/PageController';
import { collectionPlan } from './collectionPlan';
import { actionFields, actionInput, emptyDraft, field, value } from './draft';
import type { EditorPlan } from './EditorPlan';

export function clipPlan(
  content: PageContent,
  page: PageController,
  id: string | null,
): EditorPlan | null {
  if (content.kind !== PageKind.Streaming) return null;
  return collectionPlan(
    page.clips,
    content.clips,
    id,
    (row) =>
      emptyDraft(
        row === null ? 'Add clip' : 'Edit clip',
        [
          field(Key.Eyebrow, 'Eyebrow', row?.eyebrow ?? ''),
          field(Key.Title, 'Title', row?.title ?? ''),
          field(Key.Category, 'Category', row?.category ?? ''),
          ...actionFields(row?.action ?? null, true),
        ],
        row !== null,
      ),
    (draft) => ({
      eyebrow: value(draft, Key.Eyebrow),
      title: value(draft, Key.Title),
      category: value(draft, Key.Category),
      action: actionInput(draft)!,
    }),
  );
}
export function appearancePlan(
  content: PageContent,
  page: PageController,
  id: string | null,
): EditorPlan | null {
  if (content.kind !== PageKind.Press) return null;
  return collectionPlan(
    page.appearances,
    content.appearances,
    id,
    (row) =>
      emptyDraft(
        row === null ? 'Add appearance' : 'Edit appearance',
        [
          field(Key.Year, 'Year', row?.year ?? ''),
          field(Key.Title, 'Title', row?.title ?? ''),
          field(Key.Format, 'Format', row?.format ?? ''),
          field(Key.Url, 'URL (optional)', row?.url ?? '', 'url', false),
        ],
        row !== null,
      ),
    (draft) => ({
      year: value(draft, Key.Year),
      title: value(draft, Key.Title),
      format: value(draft, Key.Format),
      url: value(draft, Key.Url) || null,
    }),
  );
}
export function chapterPlan(
  content: PageContent,
  page: PageController,
  id: string | null,
): EditorPlan | null {
  if (content.kind !== PageKind.Bio) return null;
  return collectionPlan(
    page.chapters,
    content.chapters,
    id,
    (row) =>
      emptyDraft(
        row === null ? 'Add chapter' : 'Edit chapter',
        [
          field(Key.Eyebrow, 'Eyebrow', row?.eyebrow ?? ''),
          field(Key.Heading, 'Heading', row?.heading ?? ''),
          field(Key.Body, 'Body', row?.body ?? '', 'textarea'),
        ],
        row !== null,
      ),
    (draft) => ({
      eyebrow: value(draft, Key.Eyebrow),
      heading: value(draft, Key.Heading),
      body: value(draft, Key.Body),
    }),
  );
}
export function currentPlan(
  content: PageContent,
  page: PageController,
  id: string | null,
): EditorPlan | null {
  if (content.kind !== PageKind.Bio) return null;
  return collectionPlan(
    page.currentItems,
    content.currentItems,
    id,
    (row) =>
      emptyDraft(
        row === null ? 'Add current work' : 'Edit current work',
        [
          field(Key.Eyebrow, 'Eyebrow', row?.eyebrow ?? ''),
          field(Key.Title, 'Title', row?.title ?? ''),
          field(
            Key.Description,
            'Description',
            row?.description ?? '',
            'textarea',
          ),
          ...actionFields(row?.link ?? null, false),
        ],
        row !== null,
      ),
    (draft) => ({
      eyebrow: value(draft, Key.Eyebrow),
      title: value(draft, Key.Title),
      description: value(draft, Key.Description),
      link: actionInput(draft),
    }),
  );
}
