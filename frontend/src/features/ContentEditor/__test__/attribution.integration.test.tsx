import { expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fixturePorts } from '../../../../../test/fakes';
import { aHomeDTO, aMediaAssetDTO } from '../../../../../test/contentFixtures';
import { ContentEditorWired } from '../ContentEditor.wired';

it('retains the wired editor attribution from upload through the published image association', async () => {
  const user = userEvent.setup();
  const ports = fixturePorts();
  const dto = aHomeDTO();
  const uploaded = aMediaAssetDTO({
    id: '00000000-0000-4000-8000-000000000015',
  });
  let release!: () => void;
  const response = new Promise<{ status: number; data: typeof uploaded }>(
    (resolve) => {
      release = () => resolve({ status: 201, data: uploaded });
    },
  );
  vi.mocked(ports.http.request).mockImplementation(async (path, method) => {
    if (path === '/api/v2/media/assets/') return response as never;
    if (method === 'PATCH')
      return {
        status: 200,
        data: {
          page_id: dto.page.id,
          key: 'portrait',
          image: { ...dto.images[0]!.image, asset: uploaded },
        },
      } as never;
    return { status: 200, data: dto } as never;
  });
  const services = ports.services();
  await services.page(dto.page.id).load();
  render(<ContentEditorWired services={services} pageId={dto.page.id} />);
  act(() =>
    services.editor(dto.page.id).open({ type: 'image', key: 'portrait' }),
  );
  const credit = screen.getByLabelText('New image credit');
  const source = screen.getByLabelText('New image source URL');
  await user.type(credit, uploaded.credit);
  await user.type(source, uploaded.source_url);
  await user.upload(
    screen.getByLabelText('Choose image'),
    new File(['image'], 'portrait.png', { type: 'image/png' }),
  );
  expect(credit).toBeDisabled();
  expect(source).toBeDisabled();
  const body = vi
    .mocked(ports.http.request)
    .mock.calls.find(([path]) => path === '/api/v2/media/assets/')![2];
  expect(body).toBeInstanceOf(FormData);
  expect((body as FormData).get('credit')).toBe(uploaded.credit);
  expect((body as FormData).get('source_url')).toBe(uploaded.source_url);
  await act(async () => release());
  expect(credit).toHaveValue(uploaded.credit);
  expect(source).toHaveValue(uploaded.source_url);
  await user.type(credit, 'Discarded edit');
  await user.type(source, '/discarded');
  expect(credit).toHaveValue(uploaded.credit);
  expect(source).toHaveValue(uploaded.source_url);
  await user.click(screen.getByRole('button', { name: 'Publish changes' }));
  await waitFor(() =>
    expect(services.editor(dto.page.id).getSnapshot().draft).toBeNull(),
  );
  expect(ports.http.request).toHaveBeenLastCalledWith(
    '/api/v2/pages/images/',
    'PATCH',
    {
      page_id: dto.page.id,
      key: 'portrait',
      image: {
        asset_id: uploaded.id,
        alt_text: 'Portrait',
        caption: 'In the studio',
      },
    },
    true,
    'content',
  );
  expect(
    services.page(dto.page.id).getSnapshot().content!.images[0]!.image.asset,
  ).toMatchObject({ credit: uploaded.credit, sourceUrl: uploaded.source_url });
  services.dispose();
});
