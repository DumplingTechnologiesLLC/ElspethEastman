import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Skills } from '../Skills.presentational';
import { skillsView } from '../../../stories/viewModels';
it('renders skills and emits selection callbacks', () => {
  const select = vi.fn();
  render(<Skills {...skillsView} select={select} />);
  for (const label of ['Streaming', 'Game Development', 'Voice Acting'])
    fireEvent.click(screen.getByRole('button', { name: label }));
  expect(select).toHaveBeenCalledTimes(3);
  expect(screen.getByText(skillsView.skills.voice_acting)).toBeInTheDocument();
});
it('renders loading and missing content without services', () => {
  const view = render(<Skills {...skillsView} loaded={false} lookup={{}} />);
  expect(
    view.container.querySelector('[data-icon="spinner"]'),
  ).toBeInTheDocument();
  view.rerender(
    <Skills
      {...skillsView}
      skills={{ ...skillsView.skills, voice_acting: '' }}
      lookup={{}}
    />,
  );
  expect(screen.getByText('Skills failed to load...')).toBeInTheDocument();
});
it('emits editor changes, reset and save callbacks across loading and error states', () => {
  const change = vi.fn(),
    reset = vi.fn(),
    save = vi.fn();
  const view = render(
    <Skills {...skillsView} editor change={change} reset={reset} save={save} />,
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'New voice' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Reset Changes' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save All Changes' }));
  expect(change).toHaveBeenCalledWith('New voice');
  expect(reset).toHaveBeenCalledOnce();
  expect(save).toHaveBeenCalledOnce();
  view.rerender(<Skills {...skillsView} editor loaded={false} lookup={{}} />);
  expect(screen.getByRole('textbox')).toHaveValue('Loading...');
  view.rerender(
    <Skills
      {...skillsView}
      editor
      draft={{ ...skillsView.draft, voice_acting: '' }}
      errors={{ voice_acting: ['Required'] }}
      submitting
    />,
  );
  expect(screen.getByRole('textbox')).toHaveValue('');
  expect(
    screen.getByRole('button', { name: 'Save All Changes' }),
  ).toBeDisabled();
  view.rerender(<Skills {...skillsView} editor lookup={{}} />);
  expect(screen.getByRole('textbox')).toHaveValue('Skills failed to load.');
});
