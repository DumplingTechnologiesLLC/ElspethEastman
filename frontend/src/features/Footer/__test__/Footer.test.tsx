import { NEW_AFFILIATION_ID } from '../../../domain/models/NEW_AFFILIATION_ID';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Footer } from '../Footer.presentational';
import { AffiliationForm } from '../AffiliationForm.presentational';
import { footerView } from '../../../stories/viewModels';
it('renders public facts, affiliation links, loading and failed states independently', () => {
  const view = render(<Footer {...footerView} />);
  expect(screen.getByRole('link', { name: 'Studio' })).toHaveAttribute(
    'href',
    'https://example.invalid',
  );
  view.rerender(
    <Footer
      {...footerView}
      data={{
        ...footerView.data,
        affiliations: [{ id: 1, affiliation: 'Studio', link: null }],
      }}
    />,
  );
  expect(screen.getByText('Studio')).not.toHaveAttribute('href');
  view.rerender(<Footer {...footerView} loaded={false} />);
  expect(view.container.querySelectorAll('[data-icon="spinner"]')).toHaveLength(
    2,
  );
  view.rerender(
    <Footer {...footerView} data={{ stats: [], affiliations: [] }} />,
  );
  expect(screen.getByText('Failed to load stats.')).toBeInTheDocument();
});
it('delegates changes, reset, save, delete and modal visibility in editor mode', () => {
  const change = vi.fn(),
    reset = vi.fn(),
    save = vi.fn(),
    remove = vi.fn(),
    show = vi.fn();
  const view = render(
    <Footer
      {...footerView}
      editor
      open
      change={change}
      reset={reset}
      save={save}
      remove={remove}
      show={show}
    />,
  );
  const modal = screen.getByRole('dialog', { name: 'Add new Affiliation' });
  for (const input of view.container.querySelectorAll('input'))
    fireEvent.change(input, { target: { value: 'Edited' } });
  for (const button of screen.getAllByRole('button', { name: 'Save' }))
    fireEvent.click(button);
  for (const button of screen.getAllByRole('button', { name: 'Reset' }))
    fireEvent.click(button);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(
    screen.getByRole('button', { name: 'Create new affiliation' }),
  );
  fireEvent.click(within(modal).getByRole('button', { name: 'Close Modal' }));
  expect(change).toHaveBeenCalledTimes(4);
  expect(save).toHaveBeenCalledWith(NEW_AFFILIATION_ID);
  expect(save).toHaveBeenCalledWith(1);
  expect(reset).toHaveBeenCalledWith(NEW_AFFILIATION_ID);
  expect(reset).toHaveBeenCalledWith(1);
  expect(remove).toHaveBeenCalledWith(1);
  expect(show).toHaveBeenCalledWith(true);
  expect(show).toHaveBeenCalledWith(false);
  view.rerender(
    <Footer
      {...footerView}
      editor
      data={{
        ...footerView.data,
        affiliations: [{ id: 1, affiliation: 'Studio', link: null }],
      }}
      errors={{ 1: { affiliation: ['Required'] } }}
      busy={[1]}
    />,
  );
  expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
});
it('renders default affiliation form deletion and field error states', () => {
  render(
    <AffiliationForm
      text="Studio"
      link=""
      onTextChange={vi.fn()}
      onLinkChange={vi.fn()}
      onReset={vi.fn()}
      onSubmit={vi.fn()}
      disabled={false}
      errors={{ link: 'Invalid' }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  expect(screen.getByText('Invalid')).toBeInTheDocument();
});
