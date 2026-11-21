import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  IconButton,
  ActionLink,
  Field,
  Eyebrow,
} from '../Controls.presentational';

it('renders real buttons and safe external/internal links with intrinsic asset dimensions', () => {
  const click = vi.fn();
  render(
    <>
      <Button onClick={click}>Publish</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
      <IconButton aria-label="Edit" onClick={click}>
        E
      </IconButton>
      <ActionLink href="/music">Music</ActionLink>
      <ActionLink href="https://example.invalid" external>
        Watch
      </ActionLink>
      <Eyebrow>Original music</Eyebrow>
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(click).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('link', { name: 'Music' })).not.toHaveAttribute(
    'target',
  );
  expect(screen.getByRole('link', { name: 'Watch' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  expect(screen.getByRole('link', { name: 'Watch' })).toHaveAttribute(
    'target',
    '_blank',
  );
});

it('labels inputs and delegates all control kinds without owning form state', () => {
  const change = vi.fn();
  const view = render(<Field label="Title" value="" onChange={change} />);
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'A title' },
  });
  expect(change).toHaveBeenLastCalledWith('A title');
  view.rerender(
    <Field
      label="Description"
      kind="textarea"
      required
      value="Text"
      onChange={change}
      error="Required"
    />,
  );
  const area = screen.getByLabelText('Description *');
  expect(area).toHaveAttribute('aria-invalid', 'true');
  expect(
    document.getElementById(area.getAttribute('aria-describedby')!),
  ).toHaveTextContent('Required');
  fireEvent.change(area, { target: { value: 'Description' } });
  expect(change).toHaveBeenLastCalledWith('Description');
  view.rerender(
    <Field
      label="Treatment"
      kind="select"
      value="body"
      options={['body', 'headline']}
      onChange={change}
      disabled
    />,
  );
  expect(screen.getByLabelText('Treatment')).toBeDisabled();
  view.rerender(
    <Field
      label="Treatment"
      kind="select"
      value="body"
      options={['body', 'headline']}
      onChange={change}
    />,
  );
  fireEvent.change(screen.getByLabelText('Treatment'), {
    target: { value: 'headline' },
  });
  expect(change).toHaveBeenLastCalledWith('headline');
});
it('focuses a pointer-activated control before delegating so modal openers work in WebKit', () => {
  const active = vi.fn(() => document.activeElement);
  render(
    <>
      <Button onClick={active}>Open editor</Button>
      <IconButton aria-label="Image editor" onClick={active}>
        E
      </IconButton>
      <IconButton aria-label="Information">I</IconButton>
    </>,
  );
  for (const name of ['Open editor', 'Image editor']) {
    const button = screen.getByRole('button', { name });
    fireEvent.click(button);
    expect(active).toHaveLastReturnedWith(button);
  }
  const info = screen.getByRole('button', { name: 'Information' });
  fireEvent.click(info);
  expect(document.activeElement).toBe(info);
});
