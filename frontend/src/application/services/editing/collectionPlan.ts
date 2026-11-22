import type { ContentDraft } from '../../../domain/models/ContentEditor';
import type { OrderedPageRecord, PageScope } from '../../../domain/models/Page';
import type { PageCollectionController } from '../../../domain/ports/PageController';
import type { EditorPlan } from './EditorPlan';

export function collectionPlan<
  T extends OrderedPageRecord,
  Input extends PageScope,
>(
  controller: PageCollectionController<T, Input>,
  rows: readonly T[],
  id: string | null,
  describe: (record: T | null) => ContentDraft,
  input: (draft: ContentDraft) => Omit<Input, 'pageId'>,
): EditorPlan | null {
  const record = id === null ? null : rows.find((row) => row.id === id);
  if (record === undefined) return null;
  return {
    draft: describe(record),
    save: (draft) =>
      record === null
        ? controller.create(input(draft))
        : controller.update(record.id, input(draft)),
    ...(record === null ? {} : { remove: () => controller.remove(record.id) }),
  };
}
