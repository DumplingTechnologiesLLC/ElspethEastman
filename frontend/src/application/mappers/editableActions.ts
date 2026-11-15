import type { EditableActions } from '../viewModels/EditableActions';
import type { EditorTarget } from '../../domain/models/ContentEditor';
import type { PageCollection } from '../../domain/models/PageCollection';
import type { PageController } from '../../domain/ports/PageController';
import type { ContentEditorController } from '../../domain/ports/ContentEditorController';

export function editActions(
  editor: ContentEditorController,
  target: EditorTarget,
  disabled: boolean,
  canDelete: boolean,
): EditableActions {
  return {
    disabled,
    edit: () => editor.open(target),
    remove: canDelete
      ? () => {
          editor.open(target);
          editor.confirmDelete(true);
        }
      : null,
    order: null,
    feature: null,
  };
}
export function collectionActions(
  page: PageController,
  editor: ContentEditorController,
  target: EditorTarget,
  collection: PageCollection,
  section: string | null,
  ids: readonly number[],
  index: number,
): EditableActions {
  const id = ids[index]!;
  return {
    ...editActions(editor, target, page.getSnapshot().mutating, true),
    order: {
      id,
      scope: `${page.pageId}/${collection}/${section}`,
      up:
        index === 0
          ? null
          : () => {
              void page.move({
                collection,
                section,
                itemId: id,
                beforeId: ids[index - 1]!,
              });
            },
      down:
        index === ids.length - 1
          ? null
          : () => {
              void page.move({
                collection,
                section,
                itemId: id,
                beforeId: ids[index + 2] ?? null,
              });
            },
      before: (sourceId) => {
        void page.move({ collection, section, itemId: sourceId, beforeId: id });
      },
    },
  };
}
