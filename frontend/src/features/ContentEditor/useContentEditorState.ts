import { useSyncExternalStore } from 'react';
import type { ServiceContainer } from '../../composition/ServiceContainer';
import type { PageId } from '../../domain/models/Page';
import { useContentEditorService } from '../../hooks/useContentEditorService';
export interface ContentEditorWiring {
  readonly services: ServiceContainer;
  readonly pageId: PageId;
}
export function useContentEditorState(props: ContentEditorWiring) {
  const controller = useContentEditorService(props);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const { draft, saving, uploading, confirmingDelete, error } = state;
  return {
    form:
      draft === null
        ? null
        : {
            title: draft.title,
            canDelete: draft.canDelete,
            fields: draft.fields.map((item) => ({
              ...item,
              error: error?.fields[item.key]?.join(' ') ?? '',
            })),
            image:
              draft.image === null
                ? null
                : {
                    url: draft.image.asset?.url ?? null,
                    required: draft.image.required,
                  },
            rows:
              draft.rows === null
                ? null
                : {
                    title: draft.rows.title,
                    canAdd: draft.rows.items.length < draft.rows.max,
                    items: draft.rows.items.map((item, index) => ({
                      ...item,
                      canRemove: !draft.rows!.requiredKeys.includes(item.key),
                      canMoveUp: index > 0,
                      canMoveDown: index < draft.rows!.items.length - 1,
                    })),
                  },
          },
    saving,
    uploading,
    confirmingDelete,
    errors:
      error === null
        ? []
        : [...new Set([error.detail, ...Object.values(error.fields).flat()])],
    change: controller.change,
    cancel: controller.cancel,
    addRow: controller.addRow,
    changeRow: controller.changeRow,
    removeRow: controller.removeRow,
    moveRow: controller.moveRow,
    upload: controller.upload,
    removeImage: controller.removeImage,
    save: controller.save,
    confirmDelete: controller.confirmDelete,
    remove: controller.remove,
  };
}
