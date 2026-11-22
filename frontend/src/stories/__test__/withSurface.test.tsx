import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { withSurface } from '../withSurface';
it('gives isolated controls their designed surface without application services', () => {
  render(withSurface(() => <button>Story content</button>, {} as never));
  expect(
    screen.getByRole('button', { name: 'Story content' }),
  ).toBeInTheDocument();
});
