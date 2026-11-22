import type { ContentFailure } from './ContentResult';
import type { EntryMetadataInput } from './ContentEntry';
import type { MediaAsset } from './MediaAsset';
import type { PageCollection } from './PageCollection';

export enum EditorFieldKey {
  Title = 'title',
  Slug = 'slug',
  Label = 'label',
  Value = 'value',
  Eyebrow = 'eyebrow',
  Description = 'description',
  Category = 'category',
  PublishedAt = 'publishedAt',
  Year = 'year',
  Format = 'format',
  Url = 'url',
  ActionLabel = 'action.label',
  ActionUrl = 'action.url',
  AltText = 'image.altText',
  Caption = 'image.caption',
  Credit = 'image.credit',
  SourceUrl = 'image.sourceUrl',
  Heading = 'heading',
  Body = 'body',
  ArtworkTitle = 'artworkTitle',
  CopyKind = 'kind',
}
export type EditorInputKind =
  'text' | 'textarea' | 'url' | 'datetime-local' | 'select';
export interface EditorField {
  readonly key: EditorFieldKey;
  readonly label: string;
  readonly value: string;
  readonly kind: EditorInputKind;
  readonly required: boolean;
  readonly options: readonly string[];
}
export interface EditorImage {
  readonly asset: MediaAsset | null;
  readonly required: boolean;
}
export interface EditorRows {
  readonly title: string;
  readonly max: number;
  readonly items: readonly EntryMetadataInput[];
  readonly requiredKeys: readonly string[];
}
export interface ContentDraft {
  readonly title: string;
  readonly fields: readonly EditorField[];
  readonly image: EditorImage | null;
  readonly rows: EditorRows | null;
  readonly canDelete: boolean;
}
export interface ContentEditorState {
  readonly draft: ContentDraft | null;
  readonly saving: boolean;
  readonly uploading: boolean;
  readonly attributionLocked: boolean;
  readonly confirmingDelete: boolean;
  readonly error: ContentFailure | null;
}
export type EditorTarget =
  | { readonly type: 'settings' | 'practice' }
  | { readonly type: 'image'; readonly key: string }
  | {
      readonly type: PageCollection.Copy;
      readonly key: string | null;
      readonly section: string;
    }
  | {
      readonly type: Exclude<PageCollection, PageCollection.Copy>;
      readonly id: string | null;
    };
