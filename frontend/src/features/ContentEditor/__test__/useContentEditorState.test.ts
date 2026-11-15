import { expect, it } from 'vitest';
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
    initialProps: { services, pageId: 2 },
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
