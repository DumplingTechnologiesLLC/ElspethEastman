import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from '../ContactForm.presentational';
import { contactFormView } from '../ContactForm.stories';
it('delegates inline contact changes/submission, presents errors, and disables duplicates', () => {
  const change = vi.fn(),
    submit = vi.fn();
  const view = render(
    <ContactForm {...contactFormView} change={change} submit={submit} />,
  );
  for (const [label, key] of [
    ['Name', 'name'],
    ['Email', 'email'],
    ['Message', 'message'],
  ])
    fireEvent.change(screen.getByLabelText(label!), { target: { value: key } });
  expect(change.mock.calls).toEqual([
    ['name', 'name'],
    ['email', 'email'],
    ['message', 'message'],
  ]);
  fireEvent.submit(screen.getByRole('form'));
  expect(submit).toHaveBeenCalledOnce();
  expect(
    screen.getByRole('link', { name: 'elspeth@elspetheastman.com' }),
  ).toHaveAttribute('href', 'mailto:elspeth@elspetheastman.com');
  view.rerender(
    <ContactForm
      {...contactFormView}
      errors={{
        name: 'Name required',
        email: 'Invalid email',
        message: 'Message required',
      }}
    />,
  );
  expect(document.activeElement).toBe(screen.getByLabelText('Name'));
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  view.rerender(
    <ContactForm
      {...contactFormView}
      submitting
      errors={{ general: 'Please try again' }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  expect(screen.getByLabelText('Name')).toBeDisabled();
  contactFormView.change();
});
it('keeps its story submit independent of application services', async () => {
  await contactFormView.submit();
});

it('waits for a submission validation result and retains focus while its errors clear', () => {
  const view = render(<ContactForm {...contactFormView} />);
  fireEvent.submit(screen.getByRole('form'));
  view.rerender(<ContactForm {...contactFormView} errors={{}} />);
  view.rerender(
    <ContactForm
      {...contactFormView}
      errors={{ name: 'Name required', email: 'Email required' }}
    />,
  );
  const name = screen.getByLabelText('Name');
  expect(name).toHaveFocus();
  view.rerender(
    <ContactForm
      {...contactFormView}
      draft={{ ...contactFormView.draft, name: 'A' }}
      errors={{ email: 'Email required' }}
    />,
  );
  expect(name).toHaveFocus();
  fireEvent.submit(screen.getByRole('form'));
  view.rerender(
    <ContactForm {...contactFormView} errors={{ email: 'Email required' }} />,
  );
  expect(screen.getByLabelText('Email')).toHaveFocus();
  fireEvent.submit(screen.getByRole('form'));
  view.rerender(
    <ContactForm
      {...contactFormView}
      errors={{ general: 'Please try again' }}
    />,
  );
  expect(screen.getByLabelText('Email')).toHaveFocus();
  view.rerender(
    <ContactForm {...contactFormView} errors={{ name: 'Name required' }} />,
  );
  expect(screen.getByLabelText('Email')).toHaveFocus();
});
