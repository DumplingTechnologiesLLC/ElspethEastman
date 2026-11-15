import type { ContentEntry } from '../../domain/models/ContentEntry';
import { PageCollection } from '../../domain/models/PageCollection';
import type { PageController } from '../../domain/ports/PageController';
import type { ContentEditorController } from '../../domain/ports/ContentEditorController';
import type { WorkEntryView } from '../viewModels/WorkEntryView';
import { collectionActions } from './editableActions';
const dates = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
});
export function workEntry(
  entry: ContentEntry,
  page: PageController,
  editor: ContentEditorController,
  editing: boolean,
  ids: readonly number[],
  index: number,
): WorkEntryView {
  const actions = editing
    ? collectionActions(
        page,
        editor,
        { type: PageCollection.ContentEntries, id: entry.id },
        PageCollection.ContentEntries,
        null,
        ids,
        index,
      )
    : null;
  return {
    id: entry.id,
    title: entry.title,
    eyebrow: entry.eyebrow,
    description: entry.description,
    image:
      entry.image === null
        ? null
        : {
            url: entry.image.asset.url,
            altText: entry.image.altText,
            caption: entry.image.caption,
          },
    metadata: entry.metadata.map(({ key, label, value }) => ({
      key,
      label,
      value,
    })),
    action: entry.action,
    publication:
      entry.publishedAt === null
        ? null
        : dates.format(new Date(entry.publishedAt)),
    badge: editing && entry.isFeatured ? 'Featured' : null,
    actions:
      actions === null
        ? null
        : {
            ...actions,
            feature:
              entry.image === null && !entry.isFeatured
                ? null
                : {
                    label: entry.isFeatured ? 'Remove feature' : 'Feature',
                    apply: () => {
                      void page.feature(entry.isFeatured ? null : entry.id);
                    },
                  },
          },
  };
}
