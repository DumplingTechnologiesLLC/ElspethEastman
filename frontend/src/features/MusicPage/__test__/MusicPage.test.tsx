import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MusicPage } from '../MusicPage.presentational';
import { musicPageView, MusicPreview, CMS } from '../MusicPage.stories';
it('shows separate practice facts and release actions, with a stable release anchor', () => {
  const view = render(<MusicPreview {...musicPageView} />);
  expect(
    screen.getByRole('link', { name: 'Explore the music' }),
  ).toHaveAttribute('href', '#releases');
  expect(screen.getByRole('link', { name: 'Watch progress' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  expect(screen.getAllByRole('link', { name: 'Listen' })).toHaveLength(4);
  expect(
    screen.getByRole('region', { name: 'Music releases' }),
  ).toHaveAttribute('id', 'releases');
  expect(
    screen.getByRole('img', { name: 'Elspeth practicing cello' }),
  ).toBeInTheDocument();
  const add = vi.fn(),
    addReleaseHeading = vi.fn();
  view.rerender(
    <MusicPage
      {...musicPageView}
      {...CMS.args}
      controls={{ disabled: false, add, addReleaseHeading }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add release' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add releases heading' }));
  expect(add).toHaveBeenCalledOnce();
  expect(addReleaseHeading).toHaveBeenCalledOnce();
  view.rerender(
    <MusicPage
      {...musicPageView}
      practice={{ ...musicPageView.practice, facts: [] }}
      releases={[
        {
          ...musicPageView.releases[0]!,
          action: { label: 'Listen', href: '#local', isExternal: false },
        },
      ]}
    />,
  );
  expect(
    within(
      screen.getByRole('region', { name: 'Current practice' }),
    ).queryByText('Popper · Etude No. 7'),
  ).toBeNull();
  expect(screen.getByRole('link', { name: 'Listen' })).not.toHaveAttribute(
    'target',
  );
  view.rerender(
    <MusicPage {...musicPageView} practice={null} intro={null} releases={[]} />,
  );
  expect(screen.getByText('Releases will appear here.')).toBeInTheDocument();
  void musicPageView.retry();
  CMS.args!.controls!.add();
  CMS.args!.controls!.addReleaseHeading();
});
