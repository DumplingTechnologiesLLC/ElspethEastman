import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import type {
  ContentDraft,
  EditorField,
  EditorInputKind,
} from '../../../domain/models/ContentEditor';
import type { ContentFailure } from '../../../domain/models/ContentResult';
import type {
  ImageUse,
  ImageUseInput,
} from '../../../domain/models/MediaAsset';
import type { Link, LinkInput } from '../../../domain/models/Link';

export function field(
  key: Key,
  label: string,
  initial = '',
  kind: EditorInputKind = 'text',
  required = true,
  options: readonly string[] = [],
): EditorField {
  return { key, label, value: initial, kind, required, options };
}
export function value(draft: ContentDraft, key: Key): string {
  return draft.fields.find((item) => item.key === key)?.value ?? '';
}
export function actionFields(
  action: Link | null,
  required: boolean,
): readonly EditorField[] {
  return [
    field(
      Key.ActionLabel,
      'Action label',
      action?.label ?? '',
      'text',
      required,
    ),
    field(Key.ActionUrl, 'Action URL', action?.href ?? '', 'url', required),
  ];
}
export function imageFields(image: ImageUse | null): readonly EditorField[] {
  return [
    field(Key.AltText, 'Image alt text', image?.altText ?? '', 'text', false),
    field(
      Key.Caption,
      'Image caption',
      image?.caption ?? '',
      'textarea',
      false,
    ),
    field(Key.Credit, 'New image credit', '', 'text', false),
    field(Key.SourceUrl, 'New image source URL', '', 'url', false),
  ];
}
export function imageInput(draft: ContentDraft): ImageUseInput | null {
  return draft.image?.asset
    ? {
        assetId: draft.image.asset.id,
        altText: value(draft, Key.AltText),
        caption: value(draft, Key.Caption),
      }
    : null;
}
export function actionInput(draft: ContentDraft): LinkInput | null {
  const label = value(draft, Key.ActionLabel);
  const url = value(draft, Key.ActionUrl);
  return label === '' && url === '' ? null : { label, url };
}
export function emptyDraft(
  title: string,
  fields: readonly EditorField[],
  canDelete = false,
): ContentDraft {
  return { title, fields, image: null, rows: null, canDelete };
}
function httpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
export function validateDraft(draft: ContentDraft): ContentFailure | null {
  const errors = new Map<string, readonly string[]>();
  for (const item of draft.fields) {
    if (item.required && item.value.trim() === '')
      errors.set(item.key, ['This field is required.']);
    else if (item.value !== '' && item.kind === 'url' && !httpUrl(item.value))
      errors.set(item.key, ['Enter an HTTP or HTTPS URL.']);
    else if (item.kind === 'select' && !item.options.includes(item.value))
      errors.set(item.key, ['Choose one of the available options.']);
    else if (
      item.value !== '' &&
      item.kind === 'datetime-local' &&
      !Number.isFinite(Date.parse(item.value + 'Z'))
    )
      errors.set(item.key, ['Enter a valid UTC date and time.']);
  }
  const label = value(draft, Key.ActionLabel),
    url = value(draft, Key.ActionUrl);
  if ((label === '') !== (url === ''))
    errors.set('action', [
      'Provide both an action label and URL, or clear both.',
    ]);
  if (draft.image !== null) {
    if (draft.image.required && draft.image.asset === null)
      errors.set('image', ['Choose an image.']);
    if (draft.image.asset !== null && value(draft, Key.AltText).trim() === '')
      errors.set(Key.AltText, [
        'Describe this image for visitors who cannot see it.',
      ]);
  }
  if (draft.rows !== null) {
    for (const [index, row] of draft.rows.items.entries()) {
      if (row.label.trim() === '' || row.value.trim() === '')
        errors.set(`metadata.${index}`, ['Each row needs a label and value.']);
    }
  }
  return errors.size === 0
    ? null
    : {
        status: 400,
        detail: 'Please check the highlighted fields.',
        fields: Object.fromEntries(errors),
      };
}
