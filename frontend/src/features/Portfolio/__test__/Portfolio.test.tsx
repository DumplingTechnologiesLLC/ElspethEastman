import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Portfolio } from '../Portfolio.presentational';
import { portfolioView } from '../Portfolio.stories';

it('composes page slots, footer credits, and DOM navigation while preserving modified clicks', () => {
  const navigate = vi.fn();
  render(<Portfolio {...portfolioView} navigate={navigate} />);
  expect(screen.getByRole('main')).toHaveTextContent('Home content');
  expect(document.title).toBe('Elspeth Eastman');
  expect(screen.getByRole('contentinfo')).toHaveTextContent(
    '© 2026 Elspeth Eastman',
  );
  const voice = within(
    screen.getByRole('navigation', { name: 'Main navigation' }),
  ).getByRole('link', { name: 'Voiceover' });
  expect(voice).toHaveAttribute('aria-current', 'page');
  fireEvent.click(voice);
  expect(navigate).toHaveBeenCalledWith('/voiceover');
  fireEvent.click(screen.getByRole('link', { name: 'Elspeth Eastman' }));
  expect(navigate).toHaveBeenLastCalledWith('/');
  voice.addEventListener('click', (event) => event.preventDefault());
  for (const input of [
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
  ])
    fireEvent.click(voice, input);
  expect(navigate).toHaveBeenCalledTimes(2);
  const toggle = screen.getByRole('button', {
    name: 'Open navigation',
    hidden: true,
  });
  fireEvent.keyDown(toggle, { key: 'Enter' });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const mobile = screen.getByRole('navigation', {
    name: 'Mobile navigation',
    hidden: true,
  });
  fireEvent.keyDown(mobile, { key: 'ArrowDown' });
  fireEvent.keyDown(mobile, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  fireEvent.keyDown(toggle, { key: 'Escape' });
  fireEvent.click(toggle);
  fireEvent.click(
    within(mobile).getByRole('link', { name: 'Music', hidden: true }),
  );
  expect(navigate).toHaveBeenLastCalledWith('/music');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

it('presents session controls and error/login/missing/loading states independently of services', () => {
  const logout = vi.fn(),
    navigate = vi.fn(),
    retry = vi.fn();
  const view = render(
    <Portfolio
      {...portfolioView}
      authenticated
      editor
      logout={logout}
      navigate={navigate}
    />,
  );
  expect(screen.getByText('Content editor')).toBeInTheDocument();
  expect(screen.getByText('Editor dialog')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  expect(logout).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('link', { name: 'View public page' }));
  expect(navigate).toHaveBeenCalledWith('/cms');
  view.rerender(<Portfolio {...portfolioView} authenticated />);
  expect(screen.getByText('Editor signed in')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Edit page' })).toBeInTheDocument();
  view.rerender(
    <Portfolio
      {...portfolioView}
      screen="error"
      error="Offline"
      retry={retry}
    />,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Offline');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledOnce();
  view.rerender(
    <Portfolio {...portfolioView} screen="missing" navigate={navigate} />,
  );
  expect(
    screen.getByRole('heading', { name: 'Page not found' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Return home' }));
  expect(navigate).toHaveBeenLastCalledWith('/');
  view.rerender(<Portfolio {...portfolioView} screen="login" />);
  expect(screen.getByRole('main')).toHaveTextContent('Login form');
  view.rerender(<Portfolio {...portfolioView} screen="loading" />);
  expect(screen.getByRole('heading', { name: 'Loading…' })).toBeInTheDocument();
  view.rerender(<Portfolio {...portfolioView} screen="authenticating" />);
  expect(
    screen.getByRole('heading', { name: 'Checking your session…' }),
  ).toBeInTheDocument();
  view.rerender(<Portfolio {...portfolioView} pageKind={null} />);
  expect(screen.getByRole('heading', { name: 'Loading…' })).toBeInTheDocument();
});

it('runs story callbacks without application services', async () => {
  portfolioView.navigate();
  await portfolioView.retry();
  await portfolioView.logout();
});
