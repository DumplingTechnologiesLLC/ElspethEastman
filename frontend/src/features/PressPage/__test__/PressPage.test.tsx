import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PressPage } from '../PressPage.presentational';
import {
  pressPageView,
  pressHeroView,
  PressPreview,
  CMS,
} from '../PressPage.stories';
it('opens canonical coverage, restores the originating card, and retains safe appearance links', () => {
  const open = vi.fn(),
    close = vi.fn();
  const view = render(<PressPage {...pressPageView} open={open} />);
  expect(screen.getByRole('link', { name: 'The Geekenders' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  const origin = screen.getByRole('button', {
    name: 'Open Finding her voice again',
  });
  origin.focus();
  fireEvent.click(origin);
  expect(open).toHaveBeenCalledWith(2);
  view.rerender(
    <PressPage
      {...pressPageView}
      selected={pressPageView.entries[0]!}
      close={close}
    />,
  );
  expect(document.activeElement).toBe(
    screen.getByRole('region', { name: 'Finding her voice again' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close detail' }));
  expect(close).toHaveBeenCalledOnce();
  view.rerender(<PressPage {...pressPageView} />);
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Open Finding her voice again' }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Open The Patrick Scott Patterson Project',
    }),
  );
  view.rerender(<PressPage {...pressPageView} selected={pressHeroView} />);
  view.rerender(<PressPage {...pressPageView} {...CMS.args} />);
  for (const name of [
    'Add coverage',
    'Add appearance',
    'Add coverage heading',
    'Add appearances heading',
  ])
    fireEvent.click(screen.getByRole('button', { name }));
  view.rerender(
    <PressPage
      {...pressPageView}
      featured={null}
      entries={[]}
      appearances={[]}
      intro={null}
    />,
  );
  expect(screen.getByText('Coverage will appear here.')).toBeInTheDocument();
  expect(screen.getByText('Appearances will appear here.')).toBeInTheDocument();
  view.rerender(<PressPreview {...pressPageView} />);
  pressPageView.open();
  pressPageView.close();
  void pressPageView.retry();
});
