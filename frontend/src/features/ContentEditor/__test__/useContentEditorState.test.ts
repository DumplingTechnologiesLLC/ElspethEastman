import { expect, it, vi } from 'vitest';
import { fixturePorts } from '../../../../../test/fakes';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aPageDTO,
} from '../../../../../test/contentFixtures';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import { aMediaAssetDTO } from '../../../../../test/contentFixtures';
import { toMediaAsset } from '../../../application/mappers/contentMedia';
import { emptyDraft, field } from '../../../application/services/editing/draft';
import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';
import { useContentEditorState } from '../useContentEditorState';

it('projects isolated field errors, image state, and row permissions from the editor interface', () => {
  const { services, editor } = mockServices();
  const hook = renderHook(useContentEditorState, {
    initialProps: { services, pageId: '00000000-0000-4000-8000-000000000002' },
  });
  expect(hook.result.current.form).toBeNull();
  act(() =>
    editor.publish({
      ...editor.getSnapshot(),
      draft: {
        ...emptyDraft('Edit', [
          field(Key.Title, 'Title', 'Name'),
          field(Key.Label, 'Label', ''),
        ]),
        image: { asset: toMediaAsset(aMediaAssetDTO()), required: false },
        rows: {
          title: 'Details',
          max: 2,
          requiredKeys: ['outlet'],
          items: [
            { key: 'outlet', label: 'Outlet', value: 'Name' },
            { key: 'details', label: 'Format', value: 'Video' },
          ],
        },
      },
      error: {
        status: 400,
        detail: 'Invalid',
        fields: { title: ['Required', 'Too short'] },
      },
    }),
  );
  expect(hook.result.current.form).toMatchObject({
    fields: [{ error: 'Required Too short' }, { error: '' }],
    image: { url: '/media/uploads/portrait.png', required: false },
    rows: {
      canAdd: false,
      items: [
        { canRemove: false, canMoveUp: false, canMoveDown: true },
        { canRemove: true, canMoveUp: true, canMoveDown: false },
      ],
    },
  });
  expect(hook.result.current.errors).toEqual([
    'Invalid',
    'Required',
    'Too short',
  ]);
  act(() =>
    editor.publish({
      ...editor.getSnapshot(),
      error: null,
      draft: {
        ...emptyDraft('New', [field(Key.Title, 'Title')]),
        image: { asset: null, required: true },
      },
    }),
  );
  expect(hook.result.current.form).toMatchObject({
    image: { url: null },
    rows: null,
    fields: [{ error: '' }],
  });
  act(() =>
    editor.publish({ ...editor.getSnapshot(), draft: emptyDraft('New', []) }),
  );
  expect(hook.result.current.form!.image).toBeNull();
  expect(hook.result.current.save).toBe(editor.save);
  hook.unmount();
  expect(editor.stop).toHaveBeenCalledOnce();
});

it('cancels the previous page draft and sends saves through the current page and service owner', async () => {
  const home = aPageDTO('home').id;
  const voice = aPageDTO('voiceover').id;
  function scope() {
    const ports = fixturePorts();
    vi.mocked(ports.http.request).mockImplementation(async (path, method) => {
      const kind = path.includes(home) ? 'home' : 'voiceover';
      return {
        status: 200,
        data:
          method === 'PATCH'
            ? { ...aPageDTO(kind), title: 'Updated' }
            : kind === 'home'
              ? aHomeDTO()
              : aVoiceoverDTO(),
      } as never;
    });
    return { ports, services: ports.services() };
  }
  const first = scope();
  const second = scope();
  await Promise.all([
    first.services.page(home).load(),
    first.services.page(voice).load(),
    second.services.page(voice).load(),
  ]);
  const { result, rerender, unmount } = renderHook(useContentEditorState, {
    initialProps: { services: first.services, pageId: home },
  });
  act(() => first.services.editor(home).open({ type: 'settings' }));
  expect(result.current.form).not.toBeNull();
  rerender({ services: first.services, pageId: voice });
  expect(first.services.editor(home).getSnapshot().draft).toBeNull();
  expect(result.current.form).toBeNull();
  act(() => first.services.editor(voice).open({ type: 'settings' }));
  act(() => result.current.change(Key.Title, 'Current page'));
  await act(async () => result.current.save());
  expect(first.ports.http.request).toHaveBeenLastCalledWith(
    `/api/v2/pages/${voice}/`,
    'PATCH',
    expect.objectContaining({ title: 'Current page' }),
    true,
    'content',
  );
  act(() => first.services.editor(voice).open({ type: 'settings' }));
  rerender({ services: second.services, pageId: voice });
  expect(first.services.editor(voice).getSnapshot().draft).toBeNull();
  expect(result.current.form).toBeNull();
  act(() => second.services.editor(voice).open({ type: 'settings' }));
  act(() => result.current.change(Key.Title, 'Current container'));
  await act(async () => result.current.save());
  expect(second.ports.http.request).toHaveBeenLastCalledWith(
    `/api/v2/pages/${voice}/`,
    'PATCH',
    expect.objectContaining({ title: 'Current container' }),
    true,
    'content',
  );
  act(() => second.services.editor(voice).open({ type: 'settings' }));
  unmount();
  expect(second.services.editor(voice).getSnapshot().draft).toBeNull();
  first.services.dispose();
  second.services.dispose();
});

it('disables only upload attribution during upload and after commitment', () => {
  const { services, editor } = mockServices();
  const hook = renderHook(useContentEditorState, {
    initialProps: { services, pageId: '00000000-0000-4000-8000-000000000002' },
  });
  const draft = {
    ...emptyDraft('Image', [
      field(Key.Title, 'Title'),
      field(Key.Credit, 'New image credit'),
      field(Key.SourceUrl, 'New image source URL'),
    ]),
    image: { asset: null, required: false },
  };
  for (const [uploading, attributionLocked, disabled] of [
    [true, false, true],
    [false, true, true],
    [false, false, false],
  ]) {
    act(() =>
      editor.publish({
        ...editor.getSnapshot(),
        draft,
        uploading: uploading!,
        attributionLocked: attributionLocked!,
      }),
    );
    expect(
      hook.result.current.form!.fields.map((item) => item.disabled),
    ).toEqual([false, disabled, disabled]);
    expect(hook.result.current.attributionLocked).toBe(attributionLocked);
  }
});
