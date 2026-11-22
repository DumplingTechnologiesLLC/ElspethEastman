import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Editable } from '../Editable.presentational';
import { editableView } from '../Editable.stories';

it('delegates editor controls, keyboard ordering, and scoped native drag/drop', () => {
  const edit = vi.fn(),
    remove = vi.fn(),
    up = vi.fn(),
    down = vi.fn(),
    before = vi.fn(),
    feature = vi.fn();
  const actions = {
    ...editableView,
    edit,
    remove,
    feature: { label: 'Feature', apply: feature },
    order: { ...editableView.order!, up, down, before },
  };
  const view = render(
    <Editable actions={actions} label="role" placement="inside">
      Role content
    </Editable>,
  );
  for (const name of [
    'Edit role',
    'Delete role',
    'Move role up',
    'Move role down',
    'Feature',
  ])
    fireEvent.click(screen.getByRole('button', { name }));
  for (const command of [edit, remove, up, down, feature])
    expect(command).toHaveBeenCalledOnce();
  const wrapper = view.container.firstElementChild!;
  const data = new Map<string, string>();
  const transfer = {
    setData: (key: string, value: string) => data.set(key, value),
    getData: (key: string) => data.get(key) ?? '',
    effectAllowed: '',
  };
  fireEvent.dragStart(wrapper, { dataTransfer: transfer });
  expect(transfer.effectAllowed).toBe('move');
  fireEvent.dragOver(wrapper);
  fireEvent.drop(wrapper, { dataTransfer: transfer });
  expect(before).toHaveBeenCalledWith(editableView.order!.id);
  data.set('text/x-elspeth-scope', 'another-page');
  fireEvent.drop(wrapper, { dataTransfer: transfer });
  expect(before).toHaveBeenCalledOnce();
  data.set('text/x-elspeth-scope', actions.order.scope);
  for (const id of ['']) {
    data.set('text/x-elspeth-id', id);
    fireEvent.drop(wrapper, { dataTransfer: transfer });
  }
  expect(before).toHaveBeenCalledOnce();
  data.delete('text/x-elspeth-id');
  fireEvent.drop(wrapper, { dataTransfer: transfer });
  view.rerender(
    <Editable actions={{ ...actions, disabled: true }} label="role">
      Role content
    </Editable>,
  );
  expect(screen.getByRole('button', { name: 'Edit role' })).toBeDisabled();
  fireEvent.dragStart(wrapper, { dataTransfer: transfer });
  fireEvent.dragOver(wrapper);
  fireEvent.drop(wrapper, { dataTransfer: transfer });
  view.rerender(
    <Editable
      actions={{ ...actions, order: null, remove: null, feature: null }}
      label="role"
    >
      Role content
    </Editable>,
  );
  fireEvent.dragStart(wrapper, { dataTransfer: transfer });
  fireEvent.dragOver(wrapper);
  fireEvent.drop(wrapper, { dataTransfer: transfer });
  expect(
    screen.queryByRole('button', { name: 'Delete role' }),
  ).not.toBeInTheDocument();
  view.rerender(
    <Editable
      actions={{
        ...actions,
        order: { ...actions.order, up: null, down: null },
      }}
      label="role"
    >
      Role content
    </Editable>,
  );
  expect(screen.getByRole('button', { name: 'Move role up' })).toBeDisabled();
  view.rerender(
    <Editable actions={null} label="role">
      Public role
    </Editable>,
  );
  expect(view.container).toHaveTextContent('Public role');
  expect(screen.queryByRole('group')).not.toBeInTheDocument();
  editableView.edit();
  editableView.remove!();
  editableView.order!.up!();
  editableView.order!.down!();
  editableView.order!.before('00000000-0000-4000-8000-000000000001');
  editableView.feature!.apply();
});
