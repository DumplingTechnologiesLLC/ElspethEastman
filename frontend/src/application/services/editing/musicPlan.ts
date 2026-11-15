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

export function practicePlan(
  content: PageContent,
  page: PageController,
): EditorPlan | null {
  if (content.kind !== PageKind.Music) return null;
  const feature = content.feature;
  return {
    draft: {
      ...emptyDraft('Edit music practice', [
        field(Key.Title, 'Title', feature.title),
        field(Key.Eyebrow, 'Eyebrow', feature.eyebrow),
        field(Key.Description, 'Description', feature.description, 'textarea'),
        ...imageFields(feature.image),
        ...actionFields(feature.action, true),
      ]),
      image: { asset: feature.image.asset, required: true },
      rows: {
        title: 'Practice facts',
        max: 2,
        requiredKeys: [],
        items: feature.facts.map((fact, index) => ({
          ...fact,
          key: `practice-${index}`,
        })),
      },
    },
    save: (draft) =>
      page.practice({
        title: value(draft, Key.Title),
        eyebrow: value(draft, Key.Eyebrow),
        description: value(draft, Key.Description),
        image: imageInput(draft)!,
        action: actionInput(draft)!,
        facts: draft.rows!.items.map(({ label, value: text }) => ({
          label,
          value: text,
        })),
      }),
  };
}
export function releasePlan(
  content: PageContent,
  page: PageController,
  id: number | null,
): EditorPlan | null {
  if (content.kind !== PageKind.Music) return null;
  return collectionPlan(
    page.releases,
    content.releases,
    id,
    (row) => ({
      ...emptyDraft(
        row === null ? 'Add release' : 'Edit release',
        [
          field(Key.Year, 'Year', row?.year ?? '', 'text', false),
          field(Key.Format, 'Format', row?.format ?? ''),
          field(Key.Title, 'Title', row?.title ?? ''),
          field(
            Key.Description,
            'Description',
            row?.description ?? '',
            'textarea',
          ),
          field(
            Key.ArtworkTitle,
            'Artwork title',
            row?.artworkTitle ?? '',
            'text',
            false,
          ),
          ...imageFields(row?.artwork ?? null),
          ...actionFields(row?.action ?? null, true),
        ],
        row !== null,
      ),
      image: { asset: row?.artwork.asset ?? null, required: true },
    }),
    (draft) => ({
      year: value(draft, Key.Year),
      format: value(draft, Key.Format),
      title: value(draft, Key.Title),
      description: value(draft, Key.Description),
      artworkTitle: value(draft, Key.ArtworkTitle),
      artwork: imageInput(draft)!,
      action: actionInput(draft)!,
    }),
  );
}
