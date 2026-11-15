import { expect, it, vi } from 'vitest';
import { mockServices } from '../../../../../test/mockServices';
import { aMediaAssetDTO } from '../../../../../test/contentFixtures';
import { toMediaAsset } from '../../mappers/contentMedia';
import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import type {
  ContentDraft,
  EditorTarget,
} from '../../../domain/models/ContentEditor';
import type { ContentResult } from '../../../domain/models/ContentResult';
import type { MediaAsset } from '../../../domain/models/MediaAsset';
import type { MediaController } from '../../../domain/ports/MediaController';
import { rejectContent } from '../../../domain/models/ContentResult';
import { emptyDraft, field, imageFields, value } from '../editing/draft';
import type { EditorPlan } from '../editing/EditorPlan';
import { ContentEditorService } from '../ContentEditorService';

const file = new File(['image'], 'image.png', { type: 'image/png' });
const asset = toMediaAsset(aMediaAssetDTO());
function fixture(
  draft: ContentDraft = emptyDraft(
    'Edit',
    [field(Key.Title, 'Title', 'Original')],
    true,
  ),
) {
  const { notifications } = mockServices();
  const save = vi
    .fn<EditorPlan['save']>()
    .mockResolvedValue({ ok: true, value: {} });
  const remove = vi
    .fn<NonNullable<EditorPlan['remove']>>()
    .mockResolvedValue({ ok: true, value: undefined });
  const upload = vi
    .fn<MediaController['upload']>()
    .mockResolvedValue({ ok: true, value: asset });
  const planFor = vi.fn<(target: EditorTarget) => EditorPlan | null>(() => ({
    draft,
    save,
    remove,
  }));
  const service = new ContentEditorService(planFor, { upload }, notifications);
  return { service, save, remove, upload, planFor, notifications };
}
const rich = {
  ...emptyDraft(
    'Edit',
    [field(Key.Title, 'Title', 'Original'), ...imageFields(null)],
    true,
  ),
  image: { asset: null, required: false },
  rows: {
    title: 'Details',
    max: 3,
    requiredKeys: ['outlet'],
    items: [
      { key: 'outlet', label: 'Outlet', value: 'Press' },
      { key: 'detail-1', label: 'One', value: 'First' },
    ],
  },
} satisfies ContentDraft;

async function attemptEdits(service: ContentEditorService) {
  service.change(Key.Title, 'Blocked');
  service.addRow();
  service.changeRow('outlet', 'value', 'Blocked');
  service.removeRow('detail-1');
  service.moveRow('outlet', 1);
  service.removeImage();
  service.confirmDelete(true);
  await service.upload(file);
  await service.save();
  await service.remove();
}

it('contains actions while closed and rejects unavailable targets', async () => {
  const { service, planFor, notifications, save } = fixture();
  await attemptEdits(service);
  expect(service.getSnapshot().draft).toBeNull();
  expect(save).not.toHaveBeenCalled();
  planFor.mockReturnValueOnce(null);
  service.open({ type: 'settings' });
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Item unavailable' }),
  );
});

it('edits an isolated draft, validates before saving, retains failed values, and closes on canonical success', async () => {
  const { service, save } = fixture();
  service.open({ type: 'settings' });
  service.change(Key.Title, '');
  await service.save();
  expect(service.getSnapshot().error?.fields).toHaveProperty('title');
  expect(save).not.toHaveBeenCalled();
  service.change(Key.Title, 'Changed');
  service.change(Key.Url, 'Ignored');
  save.mockResolvedValueOnce(rejectContent('Offline'));
  await service.save();
  expect(value(service.getSnapshot().draft!, Key.Title)).toBe('Changed');
  expect(service.getSnapshot()).toMatchObject({
    saving: false,
    error: { detail: 'Offline' },
  });
  save.mockRejectedValueOnce(new Error('Unexpected rejection'));
  await service.save();
  expect(service.getSnapshot().error?.detail).toContain('Could not save');
  await service.save();
  expect(service.getSnapshot().draft).toBeNull();
});

it('keeps ordered metadata keys stable, protects required rows, and enforces the row limit', () => {
  const { service } = fixture(rich);
  service.open({ type: 'settings' });
  service.addRow();
  service.addRow();
  expect(
    service.getSnapshot().draft!.rows!.items.map((row) => row.key),
  ).toEqual(['outlet', 'detail-1', 'detail-2']);
  service.changeRow('detail-2', 'label', 'Two');
  service.changeRow('detail-2', 'value', 'Second');
  service.removeRow('outlet');
  service.removeRow('detail-1');
  expect(service.getSnapshot().draft!.rows!.items).toEqual([
    { key: 'outlet', label: 'Outlet', value: 'Press' },
    { key: 'detail-2', label: 'Two', value: 'Second' },
  ]);
  expect(rich.rows.items).toHaveLength(2);
  service.moveRow('missing', 1);
  service.moveRow('outlet', -1);
  service.moveRow('detail-2', 1);
  service.moveRow('outlet', 1);
  service.moveRow('outlet', -1);
  expect(
    service.getSnapshot().draft!.rows!.items.map((row) => row.key),
  ).toEqual(['outlet', 'detail-2']);
  service.cancel();
  service.open({ type: 'practice' });
  expect(service.getSnapshot().draft).toBe(rich);
});

it('contains image/row/delete actions when their resource does not support them', async () => {
  const draft = emptyDraft('Add', [], false);
  const { service, planFor, remove } = fixture(draft);
  planFor.mockReturnValue({ draft, save: vi.fn() });
  service.open({ type: 'settings' });
  service.addRow();
  service.changeRow('none', 'label', 'Label');
  service.removeRow('none');
  service.removeImage();
  service.confirmDelete(true);
  await service.upload(file);
  await service.remove();
  expect(service.getSnapshot().draft).toBe(draft);
  expect(remove).not.toHaveBeenCalled();
});

it('guards duplicate writes and requires explicit deletion confirmation', async () => {
  const { service, save, remove } = fixture(rich);
  service.open({ type: 'settings' });
  let resolve!: (result: ContentResult<unknown>) => void;
  save.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = service.save();
  await attemptEdits(service);
  expect(service.getSnapshot().saving).toBe(true);
  expect(save).toHaveBeenCalledOnce();
  resolve(rejectContent('Failed'));
  await pending;
  service.confirmDelete(true);
  service.confirmDelete(false);
  await service.remove();
  expect(remove).not.toHaveBeenCalled();
  service.confirmDelete(true);
  remove.mockResolvedValueOnce(rejectContent('Keep draft'));
  await service.remove();
  expect(service.getSnapshot().confirmingDelete).toBe(true);
  await service.remove();
  expect(service.getSnapshot().draft).toBeNull();
});

it('uploads an unattached asset while retaining concurrent field edits and contains failures', async () => {
  const { service, upload, save } = fixture(rich);
  service.open({ type: 'settings' });
  let resolve!: (result: ContentResult<MediaAsset>) => void;
  upload.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = service.upload(file);
  service.change(Key.AltText, 'New description');
  service.removeImage();
  service.confirmDelete(true);
  await service.upload(file);
  await service.save();
  await service.remove();
  expect(save).not.toHaveBeenCalled();
  resolve({ ok: true, value: asset });
  await pending;
  expect(service.getSnapshot().draft!.image!.asset).toBe(asset);
  expect(value(service.getSnapshot().draft!, Key.AltText)).toBe(
    'New description',
  );
  expect(upload).toHaveBeenCalledExactlyOnceWith({
    file,
    credit: '',
    sourceUrl: '',
  });
  upload.mockResolvedValueOnce(rejectContent('Upload failed'));
  await service.upload(file);
  expect(service.getSnapshot().draft!.image!.asset).toBe(asset);
  upload.mockRejectedValueOnce(new Error('Offline'));
  await service.upload(file);
  expect(service.getSnapshot().error?.detail).toContain('Could not upload');
  service.removeImage();
  expect(service.getSnapshot().draft!.image!.asset).toBeNull();
});

it('ignores a late save or upload after cancellation and reopening', async () => {
  const { service, save, upload } = fixture(rich);
  service.open({ type: 'settings' });
  let finishSave!: (result: ContentResult<unknown>) => void;
  save.mockImplementationOnce(
    () =>
      new Promise((done) => {
        finishSave = done;
      }),
  );
  const pending = service.save();
  service.cancel();
  service.open({ type: 'practice' });
  service.change(Key.Title, 'New editor');
  finishSave({ ok: true, value: {} });
  await pending;
  expect(value(service.getSnapshot().draft!, Key.Title)).toBe('New editor');
  let finishUpload!: (result: ContentResult<MediaAsset>) => void;
  upload.mockImplementationOnce(
    () =>
      new Promise((done) => {
        finishUpload = done;
      }),
  );
  const uploading = service.upload(file);
  service.cancel();
  service.open({ type: 'settings' });
  finishUpload({ ok: true, value: asset });
  await uploading;
  expect(service.getSnapshot().draft!.image!.asset).toBeNull();
  expect(service.getSnapshot().uploading).toBe(false);
});
