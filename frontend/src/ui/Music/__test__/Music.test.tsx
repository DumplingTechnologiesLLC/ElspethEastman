import { it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Music } from '../Music.presentational';
it('shows a placeholder while deferring iframe creation and cancels the timer on unmount', () => {
  vi.useFakeTimers();
  const view = render(<Music />);
  expect(screen.getByText('Loading Soundcloud...')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(500));
  expect(screen.getByTitle('My soundcloud')).toHaveAttribute(
    'src',
    expect.stringContaining('2775113'),
  );
  view.unmount();
});
