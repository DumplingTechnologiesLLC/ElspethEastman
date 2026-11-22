import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '../Dialog.presentational';
import meta from '../Dialog.stories';

it('opens a native modal, delegates dismissals, locks scrolling, and restores the connected opener', () => {
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  const close = vi.fn();
  const view = render(
    <Dialog title="Edit entry" context="Portfolio" onClose={close}>
      <input aria-label="Title" />
    </Dialog>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('open');
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(screen.getByLabelText('Title'));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(dialog);
  fireEvent(dialog, new Event('cancel', { cancelable: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  expect(close).toHaveBeenCalledTimes(3);
  view.unmount();
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(opener);
  opener.remove();
});

it('contains focus restoration when the opener was removed or was not an HTML element', () => {
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  const first = render(<Dialog {...meta.args} />);
  opener.remove();
  first.unmount();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('tabindex', '0');
  document.body.append(svg);
  svg.focus();
  const second = render(<Dialog {...meta.args} />);
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
  second.unmount();
  svg.remove();
});
