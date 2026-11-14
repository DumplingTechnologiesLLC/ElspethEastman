import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Contact } from '../Contact.presentational';
import { contactView } from '../../../stories/viewModels';
it('renders an independent form and emits field, submit and close callbacks', () => {
  const change = vi.fn(),
    show = vi.fn(),
    submit = vi.fn();
  const view = render(
    <Contact {...contactView} change={change} show={show} submit={submit} />,
  );
  for (const [name, value] of [
    ['Name', 'Visitor'],
    ['Email', 'visitor@example.invalid'],
    ['Message (Required)', 'Hello'],
  ])
    fireEvent.change(view.container.querySelector(`[name="${name}"]`)!, {
      target: { value },
    });
  expect(change).toHaveBeenCalledTimes(3);
  fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
  expect(submit).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
  expect(show).toHaveBeenCalledWith(false);
  view.rerender(<Contact {...contactView} open={false} />);
  expect(screen.queryByRole('textbox')).toBeNull();
});
it('renders validation and submitting states using props', () => {
  render(
    <Contact
      {...contactView}
      submitting
      errors={{ name: 'Required', email: ['Invalid'], message: ['One', 'Two'] }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Get in touch' })).toBeDisabled();
  expect(screen.getByText('Required')).toBeInTheDocument();
});
