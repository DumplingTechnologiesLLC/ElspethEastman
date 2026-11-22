import type { IdentifierSource } from '../../../domain/ports/IdentifierSource';
import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import type { EditorTarget } from '../../../domain/models/ContentEditor';
import { PageKind } from '../../../domain/models/Page';
import {
  PageCollection,
  PAGE_COLLECTIONS,
} from '../../../domain/models/PageCollection';
import { COPY_SECTIONS, copyKindsFor } from '../../../domain/models/PageCopy';
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

export function sharedPlan(
  content: PageContent,
  page: PageController,
  target: EditorTarget,
  identifiers: IdentifierSource,
): EditorPlan | null {
  switch (target.type) {
    case 'settings': {
      const hasAction = [
        PageKind.Voiceover,
        PageKind.Streaming,
        PageKind.Press,
      ].includes(content.kind);
      return {
        draft: emptyDraft('Page settings', [
          field(Key.Title, 'Navigation title', content.page.title),
          ...(content.kind === PageKind.Home
            ? []
            : [field(Key.Slug, 'URL slug', content.page.slug)]),
          ...(hasAction ? actionFields(content.page.primaryAction, false) : []),
        ]),
        save: (draft) =>
          page.metadata({
            title: value(draft, Key.Title),
            ...(content.kind === PageKind.Home
              ? {}
              : { slug: value(draft, Key.Slug) }),
            ...(hasAction ? { primaryAction: actionInput(draft) } : {}),
          }),
      };
    }
    case 'image': {
      const image = content.images.find((item) => item.key === target.key);
      if (image === undefined) return null;
      return {
        draft: {
          ...emptyDraft('Page image', imageFields(image.image)),
          image: { asset: image.image.asset, required: true },
        },
        // Editor validation requires an asset and contextual alt text before saving.
        save: (draft) =>
          page.image({ key: image.key, image: imageInput(draft)! }),
      };
    }
    case PageCollection.Copy: {
      if (!COPY_SECTIONS[content.kind].includes(target.section)) return null;
      const copy =
        target.key === null
          ? null
          : content.copy.find(
              (row) => row.key === target.key && row.section === target.section,
            );
      if (copy === undefined) return null;
      const key = copy?.key ?? `copy-${identifiers.next()}`;
      const kinds = copyKindsFor(target.section);
      return {
        draft: emptyDraft(
          copy === null ? 'Add text' : 'Edit text',
          [
            field(
              Key.CopyKind,
              'Text treatment',
              copy?.kind ?? kinds[0]!,
              'select',
              true,
              kinds,
            ),
            field(Key.Value, 'Text', copy?.value ?? '', 'textarea'),
          ],
          copy !== null,
        ),
        save: (draft) => {
          const input = {
            key,
            kind: kinds.find((kind) => kind === value(draft, Key.CopyKind))!,
            value: value(draft, Key.Value),
          };
          return copy === null
            ? page.copy.create({ ...input, section: target.section })
            : page.copy.update(input);
        },
        ...(copy === null ? {} : { remove: () => page.copy.remove(key) }),
      };
    }
    case PageCollection.Eyebrows:
      return collectionPlan(
        page.eyebrows,
        content.eyebrows,
        target.id,
        (row) =>
          emptyDraft(
            row === null ? 'Add identity label' : 'Edit identity label',
            [field(Key.Label, 'Label', row?.label ?? '')],
            row !== null,
          ),
        (draft) => ({ label: value(draft, Key.Label) }),
      );
    case PageCollection.Trivia:
      if (
        !PAGE_COLLECTIONS[content.kind].includes(PageCollection.Trivia) ||
        (target.id === null && content.trivia.length >= 3)
      )
        return null;
      return collectionPlan(
        page.trivia,
        content.trivia,
        target.id,
        (row) =>
          emptyDraft(
            row === null ? 'Add fact' : 'Edit fact',
            [
              field(Key.Label, 'Label', row?.label ?? ''),
              field(Key.Value, 'Value', row?.value ?? ''),
            ],
            row !== null,
          ),
        (draft) => ({
          label: value(draft, Key.Label),
          value: value(draft, Key.Value),
        }),
      );
    default:
      return null;
  }
}
