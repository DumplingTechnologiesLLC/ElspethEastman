import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import { PageKind } from '../../../domain/models/Page';
import type { PageContent } from '../../../domain/models/PageContent';
import type { PageController } from '../../../domain/ports/PageController';
import { collectionPlan } from './collectionPlan';
import {
  actionFields,
  actionInput,
  emptyDraft,
  field,
  imageFields,
  imageInput,
  value,
} from './draft';
import type { EditorPlan } from './EditorPlan';

function publicationDisplay(timestamp: string | null): string {
  return (timestamp ?? '')
    .replace(/Z$/, '')
    .replace(/(\.\d{3})\d+$/, '$1')
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '')
    .replace(/:00$/, '');
}
function publicationInput(
  edited: string,
  original: string | null,
): string | null {
  if (edited === publicationDisplay(original)) return original;
  if (edited === '') return null;
  return (edited.length === 16 ? edited + ':00' : edited) + 'Z';
}

export function entryPlan(
  content: PageContent,
  page: PageController,
  id: string | null,
): EditorPlan | null {
  if (
    content.kind !== PageKind.Voiceover &&
    content.kind !== PageKind.Streaming &&
    content.kind !== PageKind.Press
  )
    return null;
  const voice = content.kind === PageKind.Voiceover,
    press = content.kind === PageKind.Press;
  const rows = voice ? content.roles : content.entries;
  const originalPublication =
    rows.find((row) => row.id === id)?.publishedAt ?? null;
  return collectionPlan(
    page.entries,
    rows,
    id,
    (row) => ({
      ...emptyDraft(
        row === null ? 'Add entry' : 'Edit entry',
        [
          field(Key.Title, voice ? 'Character' : 'Title', row?.title ?? ''),
          field(
            Key.Eyebrow,
            voice ? 'Franchise' : 'Eyebrow',
            row?.eyebrow ?? '',
          ),
          field(
            Key.Description,
            voice ? 'Summary' : 'Description',
            row?.description ?? '',
            'textarea',
          ),
          ...imageFields(row?.image ?? null),
          ...actionFields(row?.action ?? null, !voice),
          ...(voice
            ? []
            : [
                field(
                  Key.Category,
                  'Category',
                  row?.category ?? '',
                  'text',
                  false,
                ),
              ]),
          ...(press
            ? [
                field(
                  Key.PublishedAt,
                  'Published at (UTC)',
                  publicationDisplay(originalPublication),
                  'datetime-local',
                  false,
                ),
              ]
            : []),
        ],
        row !== null,
      ),
      image: {
        asset: row?.image?.asset ?? null,
        required: voice || press || (row?.isFeatured ?? false),
      },
      rows: {
        title: 'Display metadata',
        max: Number.POSITIVE_INFINITY,
        requiredKeys: press ? ['outlet'] : [],
        items:
          row?.metadata ??
          (press ? [{ key: 'outlet', label: 'Outlet', value: '' }] : []),
      },
    }),
    (draft) => ({
      title: value(draft, Key.Title),
      eyebrow: value(draft, Key.Eyebrow),
      description: value(draft, Key.Description),
      image: imageInput(draft),
      action: actionInput(draft),
      category: voice ? null : value(draft, Key.Category) || null,
      publishedAt: press
        ? publicationInput(value(draft, Key.PublishedAt), originalPublication)
        : null,
      metadata: draft.rows!.items.map(({ key, label, value: text }) => ({
        key,
        label,
        value: text,
      })),
    }),
  );
}
