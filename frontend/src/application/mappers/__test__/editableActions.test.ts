import { expect, it } from 'vitest';
import { mockServices } from '../../../../../test/mockServices';
import { PageCollection } from '../../../domain/models/PageCollection';
import { collectionActions, editActions } from '../editableActions';

it('binds edit/delete intents and canonical collection placements without exposing implementations', () => {
  const { page, editor } = mockServices();
  const target = {
    type: PageCollection.Eyebrows,
    id: '00000000-0000-4000-8000-00000000000a',
  } as const;
  const basic = editActions(editor, target, false, false);
  basic.edit();
  expect(editor.open).toHaveBeenCalledWith(target);
  expect(basic.remove).toBeNull();
  const first = collectionActions(
    page,
    editor,
    target,
    PageCollection.Eyebrows,
    null,
    [
      '00000000-0000-4000-8000-00000000000a',
      '00000000-0000-4000-8000-00000000000b',
      '00000000-0000-4000-8000-00000000000c',
    ],
    0,
  );
  expect(first.order!.up).toBeNull();
  first.order!.down!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: '00000000-0000-4000-8000-00000000000a',
    beforeId: '00000000-0000-4000-8000-00000000000c',
  });
  first.remove!();
  expect(editor.confirmDelete).toHaveBeenCalledWith(true);
  const middle = collectionActions(
    page,
    editor,
    target,
    PageCollection.Eyebrows,
    null,
    [
      '00000000-0000-4000-8000-00000000000a',
      '00000000-0000-4000-8000-00000000000b',
      '00000000-0000-4000-8000-00000000000c',
    ],
    1,
  );
  middle.order!.up!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: '00000000-0000-4000-8000-00000000000b',
    beforeId: '00000000-0000-4000-8000-00000000000a',
  });
  middle.order!.down!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: '00000000-0000-4000-8000-00000000000b',
    beforeId: null,
  });
  middle.order!.before('00000000-0000-4000-8000-00000000000c');
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: '00000000-0000-4000-8000-00000000000c',
    beforeId: '00000000-0000-4000-8000-00000000000b',
  });
  const last = collectionActions(
    page,
    editor,
    target,
    PageCollection.Eyebrows,
    null,
    [
      '00000000-0000-4000-8000-00000000000a',
      '00000000-0000-4000-8000-00000000000b',
      '00000000-0000-4000-8000-00000000000c',
    ],
    2,
  );
  expect(last.order!.down).toBeNull();
});
