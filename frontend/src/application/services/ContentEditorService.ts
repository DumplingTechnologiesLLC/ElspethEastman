import type { ContentEditorController } from '../../domain/ports/ContentEditorController';
import type { ContentEditorState } from '../../domain/models/ContentEditor';
import { EditorFieldKey as Key } from '../../domain/models/ContentEditor';
import type { MediaController } from '../../domain/ports/MediaController';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import { rejectContent } from '../../domain/models/ContentResult';
import type { ContentResult } from '../../domain/models/ContentResult';
import type { MediaAsset } from '../../domain/models/MediaAsset';
import type { EditorPlan } from './editing/EditorPlan';
import { validateDraft, value } from './editing/draft';
import { Store } from './Store';

const closed: ContentEditorState = {
  draft: null,
  saving: false,
  uploading: false,
  confirmingDelete: false,
  error: null,
};

export class ContentEditorService
  extends Store<ContentEditorState>
  implements ContentEditorController
{
  private plan: EditorPlan | null = null;
  private version = 0;
  constructor(
    private planFor: (
      target: Parameters<ContentEditorController['open']>[0],
    ) => EditorPlan | null,
    private media: Pick<MediaController, 'upload'>,
    private alerts: UIAlerts,
  ) {
    super(closed);
  }
  open: ContentEditorController['open'] = (target) => {
    const plan = this.planFor(target);
    if (plan === null) {
      this.alerts.show({
        title: 'Item unavailable',
        content:
          'This item is no longer available. Refresh the page and try again.',
        flavor: 'error',
      });
      return;
    }
    this.version++;
    this.plan = plan;
    this.patch({ ...closed, draft: plan.draft });
  };
  cancel = () => {
    this.version++;
    this.plan = null;
    this.patch(closed);
  };
  change: ContentEditorController['change'] = (key, next) => {
    const { draft, saving } = this.getSnapshot();
    if (draft === null || saving) return;
    this.patch({
      draft: {
        ...draft,
        fields: draft.fields.map((item) =>
          item.key === key ? { ...item, value: next } : item,
        ),
      },
      error: null,
    });
  };
  addRow = () => {
    const { draft, saving } = this.getSnapshot();
    if (
      draft?.rows == null ||
      saving ||
      draft.rows.items.length >= draft.rows.max
    )
      return;
    let index = 1;
    while (draft.rows.items.some((item) => item.key === `detail-${index}`))
      index++;
    this.patch({
      draft: {
        ...draft,
        rows: {
          ...draft.rows,
          items: [
            ...draft.rows.items,
            { key: `detail-${index}`, label: '', value: '' },
          ],
        },
      },
      error: null,
    });
  };
  changeRow: ContentEditorController['changeRow'] = (key, field, next) => {
    const { draft, saving } = this.getSnapshot();
    if (draft?.rows == null || saving) return;
    this.patch({
      draft: {
        ...draft,
        rows: {
          ...draft.rows,
          items: draft.rows.items.map((item) =>
            item.key === key ? { ...item, [field]: next } : item,
          ),
        },
      },
      error: null,
    });
  };
  removeRow: ContentEditorController['removeRow'] = (key) => {
    const { draft, saving } = this.getSnapshot();
    if (draft?.rows == null || saving || draft.rows.requiredKeys.includes(key))
      return;
    this.patch({
      draft: {
        ...draft,
        rows: {
          ...draft.rows,
          items: draft.rows.items.filter((item) => item.key !== key),
        },
      },
      error: null,
    });
  };
  removeImage = () => {
    const { draft, saving, uploading } = this.getSnapshot();
    if (draft?.image == null || saving || uploading) return;
    this.patch({
      draft: { ...draft, image: { ...draft.image, asset: null } },
      error: null,
    });
  };
  moveRow: ContentEditorController['moveRow'] = (key, direction) => {
    const { draft, saving } = this.getSnapshot();
    if (draft?.rows == null || saving) return;
    const from = draft.rows.items.findIndex((item) => item.key === key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= draft.rows.items.length) return;
    const items = [...draft.rows.items];
    [items[from], items[to]] = [items[to]!, items[from]!];
    this.patch({
      draft: { ...draft, rows: { ...draft.rows, items } },
      error: null,
    });
  };
  upload: ContentEditorController['upload'] = async (file) => {
    const { draft, saving, uploading } = this.getSnapshot();
    if (draft?.image == null || saving || uploading) return;
    const version = this.version;
    this.patch({ uploading: true, error: null });
    let result: ContentResult<MediaAsset>;
    try {
      result = await this.media.upload({
        file,
        credit: value(draft, Key.Credit),
        sourceUrl: value(draft, Key.SourceUrl),
      });
    } catch {
      result = rejectContent('Could not upload this image. Please try again.');
    }
    if (version !== this.version) return;
    const current = this.getSnapshot().draft!;
    this.patch(
      result.ok
        ? {
            uploading: false,
            draft: {
              ...current,
              image: { ...current.image!, asset: result.value },
            },
          }
        : { uploading: false, error: result.error },
    );
  };
  save = async () => {
    const { draft, saving, uploading } = this.getSnapshot();
    if (draft === null || saving || uploading) return;
    const error = validateDraft(draft);
    if (error !== null) {
      this.patch({ error });
      return;
    }
    await this.commit(() => this.plan!.save(draft));
  };
  confirmDelete = (confirm: boolean) => {
    const { draft, saving, uploading } = this.getSnapshot();
    if (draft === null || saving || uploading || !draft.canDelete) return;
    this.patch({ confirmingDelete: confirm, error: null });
  };
  remove = async () => {
    const { confirmingDelete, saving, uploading } = this.getSnapshot();
    const remove = this.plan?.remove;
    if (!confirmingDelete || saving || uploading || remove === undefined)
      return;
    await this.commit(remove);
  };
  private async commit(request: () => Promise<ContentResult<unknown>>) {
    const version = this.version;
    this.patch({ saving: true, error: null });
    let result: ContentResult<unknown>;
    try {
      result = await request();
    } catch {
      result = rejectContent('Could not save changes. Please try again.');
    }
    if (version !== this.version) return;
    if (result.ok) this.cancel();
    else this.patch({ saving: false, error: result.error });
  }
}
