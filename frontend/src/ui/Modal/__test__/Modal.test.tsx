import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal.presentational';
it('keeps closed content mounted and closes using either backdrop or close button', () => {
  const close = vi.fn();
  const view = render(
    <Modal open={false} onClose={close} title="Title">
      <button>Last</button>
    </Modal>,
  );
  expect(screen.getByRole('dialog', { name: 'Title' })).toBeInTheDocument();
  view.rerender(
    <Modal open onClose={close} title="Title">
      <button>Last</button>
    </Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
  fireEvent.click(view.container.firstElementChild!.firstElementChild!);
  expect(close).toHaveBeenCalledTimes(2);
});
it('traps tab traversal at both ends and leaves other keys and middle focus unchanged', () => {
  render(
    <Modal open onClose={vi.fn()} title="Title">
      <button>Middle</button>
      <button>Last</button>
    </Modal>,
  );
  const first = screen.getByRole('button', { name: 'Close Modal' });
  const last = screen.getByRole('button', { name: 'Last' });
  first.focus();
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
  expect(last).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(first).toHaveFocus();
  screen.getByRole('button', { name: 'Middle' }).focus();
  fireEvent.keyDown(document, { key: 'Tab' });
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Middle' })).toHaveFocus();
});
