import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentEditor } from '../ContentEditor.presentational';
import { editorView } from '../ContentEditor.stories';
import { EditorFieldKey as Key } from '../../../domain/models/ContentEditor';

it('delegates field, row, image, submit, cancel, and delete-intent interactions', () => {
  const change = vi.fn(),
    changeRow = vi.fn(),
    moveRow = vi.fn(),
    upload = vi.fn(),
    save = vi.fn(),
    cancel = vi.fn(),
    confirmDelete = vi.fn(),
    removeImage = vi.fn(),
    removeRow = vi.fn(),
    addRow = vi.fn();
  const view = render(
    <ContentEditor
      {...editorView}
      change={change}
      changeRow={changeRow}
      moveRow={moveRow}
      upload={upload}
      save={save}
      cancel={cancel}
      confirmDelete={confirmDelete}
      removeImage={removeImage}
      removeRow={removeRow}
      addRow={addRow}
    />,
  );
  fireEvent.change(screen.getByLabelText('Title *'), {
    target: { value: 'New title' },
  });
  expect(change).toHaveBeenCalledWith(Key.Title, 'New title');
  fireEvent.change(screen.getByLabelText('Row 1 label *'), {
    target: { value: 'Publication' },
  });
  fireEvent.change(screen.getByLabelText('Row 2 value *'), {
    target: { value: 'Video call' },
  });
  expect(changeRow).toHaveBeenCalledWith('outlet', 'label', 'Publication');
  expect(changeRow).toHaveBeenCalledWith('detail-1', 'value', 'Video call');
  fireEvent.click(screen.getByLabelText('Move row 1 down'));
  fireEvent.click(screen.getByLabelText('Move row 2 up'));
  expect(moveRow.mock.calls).toEqual([
    ['outlet', 1],
    ['detail-1', -1],
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Add row' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove row 2' }));
  expect(addRow).toHaveBeenCalledOnce();
  expect(removeRow).toHaveBeenCalledWith('detail-1');
  fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
  expect(removeImage).toHaveBeenCalledOnce();
  const input = screen.getByLabelText('Choose image');
  const file = new File(['image'], 'image.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
  expect(upload).toHaveBeenCalledWith(file);
  fireEvent.change(input, { target: { files: [] } });
  fireEvent.change(input, { target: { files: null } });
  expect(upload).toHaveBeenCalledOnce();
  fireEvent.submit(view.container.querySelector('form')!);
  expect(save).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
  expect(confirmDelete).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(cancel).toHaveBeenCalledOnce();
});

it('renders busy, empty, validation and confirmation states without owning business transitions', () => {
  const remove = vi.fn(),
    confirmDelete = vi.fn();
  const view = render(<ContentEditor {...editorView} saving uploading />);
  expect(screen.getByRole('button', { name: 'Publishing…' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Uploading image');
  view.rerender(
    <ContentEditor
      {...editorView}
      confirmingDelete
      remove={remove}
      confirmDelete={confirmDelete}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Keep item' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
  expect(confirmDelete).toHaveBeenCalledWith(false);
  expect(remove).toHaveBeenCalledOnce();
  view.rerender(<ContentEditor {...editorView} confirmingDelete saving />);
  expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
  const form = {
    ...editorView.form,
    canDelete: false,
    image: { url: null, required: false },
    rows: { ...editorView.form.rows, canAdd: false },
    fields: editorView.form.fields.map((item) => ({
      ...item,
      error: 'Required',
    })),
  };
  view.rerender(
    <ContentEditor {...editorView} form={form} errors={['Invalid']} />,
  );
  expect(document.activeElement).toBe(screen.getByLabelText('Title *'));
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid');
  expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
  expect(
    screen.queryByRole('button', { name: 'Delete item' }),
  ).not.toBeInTheDocument();
  view.rerender(
    <ContentEditor
      {...editorView}
      form={{ ...form, image: null, rows: null, fields: [] }}
      errors={[]}
    />,
  );
  view.rerender(
    <ContentEditor
      {...editorView}
      form={{ ...form, image: null, rows: null, fields: [] }}
      errors={['Other error']}
    />,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Other error');
  view.rerender(<ContentEditor {...editorView} form={null} errors={[]} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.rerender(
    <ContentEditor {...editorView} form={null} errors={['Closed']} />,
  );
});

it('keeps every Storybook callback runnable without application services', async () => {
  editorView.change();
  editorView.cancel();
  editorView.addRow();
  editorView.changeRow();
  editorView.removeRow();
  editorView.moveRow();
  editorView.removeImage();
  editorView.confirmDelete();
  await editorView.save();
  await editorView.remove();
  await editorView.upload();
});

it('renders the locked upload attribution boundary and allows replacement metadata after removal', () => {
  const title = editorView.form.fields[0]!;
  const fields = [
    title,
    {
      ...title,
      key: Key.Credit,
      label: 'New image credit',
      value: 'Photographer',
      disabled: true,
    },
    {
      ...title,
      key: Key.SourceUrl,
      label: 'New image source URL',
      value: 'https://example.invalid/photo',
      disabled: true,
    },
  ];
  const props = { ...editorView, form: { ...editorView.form, fields } };
  const view = render(<ContentEditor {...props} uploading />);
  expect(screen.getByLabelText('New image credit *')).toBeDisabled();
  expect(screen.getByLabelText('New image source URL *')).toBeDisabled();
  expect(screen.getByLabelText('Title *')).toBeEnabled();
  view.rerender(<ContentEditor {...props} attributionLocked />);
  expect(
    screen.getByText(/Credit and source were saved with this upload/),
  ).toBeVisible();
  expect(screen.getByLabelText('New image credit *')).toBeDisabled();
  view.rerender(
    <ContentEditor
      {...props}
      form={{
        ...props.form,
        fields: fields.map((item) => ({ ...item, disabled: false })),
      }}
    />,
  );
  expect(screen.getByLabelText('New image credit *')).toBeEnabled();
  expect(
    screen.queryByText(/Credit and source were saved with this upload/),
  ).not.toBeInTheDocument();
});
