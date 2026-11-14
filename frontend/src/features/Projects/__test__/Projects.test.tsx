import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Projects } from '../Projects.presentational';
import { ProjectForm } from '../ProjectForm.presentational';
import { projectsView, sampleProject } from '../../../stories/viewModels';
it('renders public lists, empty and loading states, delegates pagination and navigation', () => {
  const nextPage = vi.fn(),
    navigate = vi.fn();
  const view = render(
    <Projects {...projectsView} nextPage={nextPage} navigate={navigate} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
  for (const button of screen.getAllByRole('button', {
    name: 'See all projects',
  }))
    fireEvent.click(button);
  expect(nextPage).toHaveBeenCalledOnce();
  expect(navigate).toHaveBeenCalledWith('/projects');
  view.rerender(
    <Projects {...projectsView} mode="all" projects={[]} navigate={navigate} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
  expect(navigate).toHaveBeenCalledWith('/');
  expect(screen.getByText('Failed to load...')).toBeInTheDocument();
  view.rerender(
    <Projects {...projectsView} mode="all" projects={[]} loaded={false} />,
  );
  expect(screen.queryByText('Failed to load...')).toBeNull();
});
it('composes independent editor forms and delegates every action', () => {
  const change = vi.fn(),
    reset = vi.fn(),
    show = vi.fn(),
    save = vi.fn(),
    saveAll = vi.fn(),
    remove = vi.fn();
  const view = render(
    <Projects
      {...projectsView}
      mode="editor"
      open
      change={change}
      reset={reset}
      show={show}
      save={save}
      saveAll={saveAll}
      remove={remove}
      errors={{ 1: { title: ['Required'] } }}
    />,
  );
  const modal = screen.getByRole('dialog', { name: 'Add new Project' });
  for (const input of view.container.querySelectorAll('input'))
    fireEvent.change(input, { target: { value: 'New' } });
  for (const button of within(modal).getAllByRole('button', {
    name: /^Save|^Reset/,
  }))
    fireEvent.click(button);
  const card = view.container.querySelector('section > div:last-child > div')!;
  fireEvent.click(
    within(card as HTMLElement).getByRole('button', { name: /^Save/ }),
  );
  fireEvent.click(
    within(card as HTMLElement).getByRole('button', { name: 'Reset' }),
  );
  fireEvent.click(
    within(card as HTMLElement).getByRole('button', { name: 'Delete' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save All' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add New Project' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
  expect(change).toHaveBeenCalledTimes(4);
  expect(save).toHaveBeenCalledWith(-1);
  expect(save).toHaveBeenCalledWith(1);
  expect(reset).toHaveBeenCalledWith(-1);
  expect(reset).toHaveBeenCalledWith(1);
  expect(remove).toHaveBeenCalledWith(1);
  expect(show).toHaveBeenCalledWith(true);
  expect(show).toHaveBeenCalledWith(false);
  expect(saveAll).toHaveBeenCalledOnce();
});
it('toggles a pure form preview, preserves DOM events and supports busy controls', () => {
  const props = {
    ...sampleProject,
    onSrcChange: vi.fn(),
    onTitleChange: vi.fn(),
    onSubmit: vi.fn(),
    onReset: vi.fn(),
    busy: false,
    errors: {},
  };
  const view = render(<ProjectForm {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
  expect(screen.getByRole('button', { name: 'View Form' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'View Form' }));
  expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
  view.rerender(<ProjectForm {...props} busy />);
  expect(
    screen
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('disabled')),
  ).toHaveLength(3);
});
