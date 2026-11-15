import { expect, it } from 'vitest';
import { mockServices } from '../../../../../test/mockServices';
import { PageCollection } from '../../../domain/models/PageCollection';
import { collectionActions, editActions } from '../editableActions';

it('binds edit/delete intents and canonical collection placements without exposing implementations', () => {
  const { page, editor } = mockServices();
  const target = { type: PageCollection.Eyebrows, id: 10 } as const;
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
    [10, 11, 12],
    0,
  );
  expect(first.order!.up).toBeNull();
  first.order!.down!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: 10,
    beforeId: 12,
  });
  first.remove!();
  expect(editor.confirmDelete).toHaveBeenCalledWith(true);
  const middle = collectionActions(
    page,
    editor,
    target,
    PageCollection.Eyebrows,
    null,
    [10, 11, 12],
    1,
  );
  middle.order!.up!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: 11,
    beforeId: 10,
  });
  middle.order!.down!();
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: 11,
    beforeId: null,
  });
  middle.order!.before(12);
  expect(page.move).toHaveBeenLastCalledWith({
    collection: 'eyebrows',
    section: null,
    itemId: 12,
    beforeId: 11,
  });
  const last = collectionActions(
    page,
    editor,
    target,
    PageCollection.Eyebrows,
    null,
    [10, 11, 12],
    2,
  );
  expect(last.order!.down).toBeNull();
});
