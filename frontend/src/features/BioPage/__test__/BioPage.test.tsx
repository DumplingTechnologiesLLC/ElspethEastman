import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BioPage } from '../BioPage.presentational';
import { bioPageView, BioPreview, CMS } from '../BioPage.stories';
const stopNavigation = (event: Event) => event.preventDefault();
it('keeps narrative and activities editable while Explore remains derived navigation', () => {
  document.body.addEventListener('click', stopNavigation);
  const navigate = vi.fn();
  const view = render(<BioPreview {...bioPageView} navigate={navigate} />);
  expect(
    screen.getByRole('img', { name: 'Portrait of Elspeth Eastman' }),
  ).toBeInTheDocument();
  const explore = within(
    screen.getByRole('region', { name: 'Explore the work' }),
  );
  const link = explore.getByRole('link', { name: 'Voiceover' });
  fireEvent.mouseEnter(link);
  fireEvent.mouseLeave(link);
  fireEvent.focus(link);
  fireEvent.blur(link);
  fireEvent.click(link);
  expect(navigate).toHaveBeenCalledWith('/voiceover');
  for (const modifier of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])
    fireEvent.click(link, modifier);
  link.addEventListener('click', (event) => event.preventDefault(), {
    once: true,
  });
  fireEvent.click(link);
  expect(navigate).toHaveBeenCalledOnce();
  view.rerender(<BioPage {...bioPageView} {...CMS.args} />);
  for (const name of [
    'Add biography text',
    'Add chapter',
    'Add story heading',
    'Add current work',
    'Add current heading',
    'Add explore heading',
  ])
    fireEvent.click(screen.getByRole('button', { name }));
  expect(
    within(
      screen.getByRole('region', { name: 'Explore the work' }),
    ).queryByRole('button', { name: 'Add link' }),
  ).toBeNull();
  view.rerender(
    <BioPage
      {...bioPageView}
      portrait={{ ...bioPageView.portrait, caption: 'Portrait credit' }}
      current={[
        {
          ...bioPageView.current[0]!,
          link: {
            label: 'Read',
            href: 'https://example.invalid/activity',
            isExternal: true,
          },
        },
        {
          ...bioPageView.current[1]!,
          link: { label: 'Local', href: '#local', isExternal: false },
        },
      ]}
    />,
  );
  expect(screen.getByText('Portrait credit')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  expect(screen.getByRole('link', { name: 'Local' })).not.toHaveAttribute(
    'target',
  );
  view.rerender(
    <BioPage
      {...bioPageView}
      intro={null}
      portrait={null}
      chapters={[]}
      current={[]}
    />,
  );
  expect(screen.getByText('Chapters will appear here.')).toBeInTheDocument();
  expect(
    screen.getByText('Current work will appear here.'),
  ).toBeInTheDocument();
  document.body.removeEventListener('click', stopNavigation);
  bioPageView.navigate();
  void bioPageView.retry();
});
