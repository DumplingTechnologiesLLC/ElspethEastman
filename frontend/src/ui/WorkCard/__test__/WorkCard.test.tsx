import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkCard } from '../WorkCard.presentational';
import meta, { tristanaView } from '../WorkCard.stories';
it('opens the loaded record and exposes grayscale/color motion to hover and keyboard focus', () => {
  const open = vi.fn();
  const view = render(<WorkCard entry={tristanaView} onOpen={open} />);
  const image = screen.getByRole('img', { name: tristanaView.image!.altText });
  const original = image.className;
  const button = screen.getByRole('button', { name: 'Open Tristana' });
  fireEvent.mouseEnter(screen.getByRole('article'));
  expect(image.className).not.toBe(original);
  fireEvent.focus(button);
  fireEvent.mouseLeave(screen.getByRole('article'));
  expect(image.className).not.toBe(original);
  fireEvent.blur(button, { relatedTarget: button });
  expect(image.className).not.toBe(original);
  fireEvent.blur(button, { relatedTarget: document.body });
  expect(image.className).toBe(original);
  fireEvent.click(button);
  expect(open).toHaveBeenCalledExactlyOnceWith(button);
  view.rerender(
    <WorkCard
      entry={{ ...tristanaView, badge: 'Featured' }}
      hero
      onOpen={open}
    />,
  );
  expect(screen.getByText('Featured')).toBeInTheDocument();
  expect(image).toHaveAttribute('loading', 'eager');
  meta.args.onOpen();
});
it('supports a static linked card and an imageless card without inventing an action', () => {
  const view = render(<WorkCard entry={tristanaView} />);
  expect(screen.getByRole('heading', { name: 'Tristana' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Project / clip' })).toHaveAttribute(
    'target',
    '_blank',
  );
  view.rerender(
    <WorkCard entry={{ ...tristanaView, image: null, action: null }} />,
  );
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
