import type { PageContent } from '../../domain/models/PageContent';
import { PageCollection } from '../../domain/models/PageCollection';
import type { PageController } from '../../domain/ports/PageController';
import type { ContentEditorController } from '../../domain/ports/ContentEditorController';
import type {
  CopyBlockView,
  IdentityView,
  ImageView,
} from '../viewModels/PageElements';
import { collectionActions, editActions } from './editableActions';

export function copyViews(
  content: PageContent,
  section: string,
  page: PageController,
  editor: ContentEditorController,
  editing: boolean,
): readonly CopyBlockView[] {
  const rows = content.copy.filter((item) => item.section === section),
    ids = rows.map((item) => item.id);
  return rows.map((item, index) => ({
    key: item.key,
    kind: item.kind,
    text: item.value,
    actions: editing
      ? collectionActions(
          page,
          editor,
          { type: PageCollection.Copy, key: item.key, section },
          PageCollection.Copy,
          section,
          ids,
          index,
        )
      : null,
  }));
}
export function identityViews(
  content: PageContent,
  page: PageController,
  editor: ContentEditorController,
  editing: boolean,
): readonly IdentityView[] {
  const ids = content.eyebrows.map((item) => item.id);
  return content.eyebrows.map((item, index) => ({
    id: item.id,
    label: item.label,
    actions: editing
      ? collectionActions(
          page,
          editor,
          { type: PageCollection.Eyebrows, id: item.id },
          PageCollection.Eyebrows,
          null,
          ids,
          index,
        )
      : null,
  }));
}
export function imageView(
  content: PageContent,
  key: string,
  editor: ContentEditorController,
  editing: boolean,
  disabled: boolean,
): ImageView | null {
  const image = content.images.find((item) => item.key === key);
  return image === undefined
    ? null
    : {
        url: image.image.asset.url,
        altText: image.image.altText,
        caption: image.image.caption,
        actions: editing
          ? editActions(editor, { type: 'image', key }, disabled, false)
          : null,
      };
}
