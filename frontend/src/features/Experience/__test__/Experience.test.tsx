import { Category } from '../../../domain/models/Category';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Experience } from '../Experience.presentational';
import { experienceView } from '../../../stories/viewModels';
it('renders category lists, empty Object.values(Category), plain credits and loading states', () => {
  const view = render(
    <Experience
      {...experienceView}
      groups={{
        ...experienceView.groups,
        [Category.MusicGames]: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            year: '',
            credit: 'Plain credit',
            link: null,
            tba: false,
          },
        ],
      }}
    />,
  );
  expect(screen.getByText('Plain credit').tagName).toBe('P');
  expect(screen.getAllByText('Coming soon!')).toHaveLength(2);
  view.rerender(<Experience {...experienceView} loaded={false} />);
  expect(screen.getAllByText('Loading')).toHaveLength(4);
});
it('delegates edit, deletion and category creation', () => {
  const edit = vi.fn(),
    remove = vi.fn();
  render(<Experience {...experienceView} editor edit={edit} remove={remove} />);
  const row = screen.getByRole('link', {
    name: /Character voice/,
  }).parentElement!;
  const buttons = within(row).getAllByRole('button');
  fireEvent.click(buttons[0]!);
  fireEvent.click(buttons[1]!);
  for (const button of screen.getAllByRole('button', { name: /Add new/ }))
    fireEvent.click(button);
  expect(remove).toHaveBeenCalledWith(
    Category.VoiceCredits,
    '00000000-0000-4000-8000-000000000001',
  );
  expect(edit).toHaveBeenCalledTimes(5);
});
it('renders an independent form with prop-driven validation and checkbox state', () => {
  const change = vi.fn(),
    reset = vi.fn(),
    save = vi.fn(),
    close = vi.fn();
  const view = render(
    <Experience
      {...experienceView}
      editor
      open
      change={change}
      reset={reset}
      save={save}
      close={close}
      errors={{ credit: 'Required' }}
    />,
  );
  const dialog = screen.getByRole('dialog', { name: 'Experience Form' });
  for (const input of dialog.querySelectorAll('input:not([type="checkbox"])'))
    fireEvent.change(input, {
      target: {
        value: input.getAttribute('type') === 'number' ? '2025' : 'Edited',
      },
    });
  fireEvent.click(within(dialog).getByText('TBA?'));
  fireEvent.click(within(dialog).getByRole('checkbox'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Reset Changes' }),
  );
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close Modal' }));
  expect(change).toHaveBeenCalledWith('year', '2025');
  expect(change).toHaveBeenCalledWith('link', 'Edited');
  expect(change).toHaveBeenCalledWith('credit', 'Edited');
  expect(change).toHaveBeenCalledWith('tba', true);
  expect(reset).toHaveBeenCalledOnce();
  expect(save).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
  view.rerender(
    <Experience
      {...experienceView}
      editor
      open
      draft={{ ...experienceView.draft, tba: true }}
    />,
  );
  expect(screen.getByRole('checkbox')).toBeChecked();
});
