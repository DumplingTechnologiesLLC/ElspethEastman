import { expect, it } from 'vitest';
import { aMediaAssetDTO } from '../../../../../test/contentFixtures';
import { mockContentRepository } from '../../../../../test/mockContentRepository';
import { mockServices } from '../../../../../test/mockServices';
import { toMediaAsset } from '../../mappers/contentMedia';
import { MediaService } from '../MediaService';

function fixture() {
  const repository = mockContentRepository();
  const { notifications, session } = mockServices();
  const service = new MediaService(repository, notifications, session);
  return { repository, notifications, session, service };
}
const input = {
  file: new File(['image'], 'image.png', { type: 'image/png' }),
  credit: 'Photographer',
  sourceUrl: '',
};

it('uploads an independent asset and blocks overlapping requests', async () => {
  const { service, repository } = fixture();
  const asset = toMediaAsset(aMediaAssetDTO());
  let resolve!: (value: { ok: true; value: typeof asset }) => void;
  repository.upload.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = service.upload(input);
  expect(service.getSnapshot().uploading).toBe(true);
  expect((await service.upload(input)).ok).toBe(false);
  resolve({ ok: true, value: asset });
  expect(await pending).toEqual({ ok: true, value: asset });
  expect(service.getSnapshot().uploading).toBe(false);
  expect(repository.upload).toHaveBeenCalledExactlyOnceWith(input);
  expect(repository.image).not.toHaveBeenCalled();
});

it('rejects empty and unsupported files before sending bytes', async () => {
  const { service, repository, notifications } = fixture();
  expect(
    (
      await service.upload({
        ...input,
        file: new File([], 'empty.png', { type: 'image/png' }),
      })
    ).ok,
  ).toBe(false);
  expect(
    (
      await service.upload({
        ...input,
        file: new File(['x'], 'script.svg', { type: 'image/svg+xml' }),
      })
    ).ok,
  ).toBe(false);
  expect(repository.upload).not.toHaveBeenCalled();
  expect(notifications.show).toHaveBeenCalledTimes(2);
});

it('reports validation/network failures and expires authentication without losing upload availability', async () => {
  const { service, repository, notifications, session } = fixture();
  repository.upload.mockResolvedValueOnce({
    ok: false,
    error: {
      status: 400,
      detail: 'Invalid image',
      fields: { file: ['Too large'] },
    },
  });
  expect((await service.upload(input)).ok).toBe(false);
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ content: 'Too large' }),
  );
  repository.upload.mockResolvedValueOnce({
    ok: false,
    error: { status: 403, detail: 'Expired', fields: {} },
  });
  await service.upload(input);
  expect(session.expire).toHaveBeenCalledWith(session.getSnapshot().path);
  repository.upload.mockRejectedValueOnce(new Error('Offline'));
  expect((await service.upload(input)).ok).toBe(false);
  expect(service.getSnapshot().uploading).toBe(false);
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({
      content: 'Could not upload this image. Please try again.',
    }),
  );
});
