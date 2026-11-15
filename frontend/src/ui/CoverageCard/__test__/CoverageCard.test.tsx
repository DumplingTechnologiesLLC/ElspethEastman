import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoverageCard } from '../CoverageCard.presentational';
import { pressHeroView } from '../../../features/PressPage/PressPage.stories';
it('supports pointer and keyboard emphasis while keeping selection on the canonical trigger', () => {
  const open = vi.fn();
  const view = render(<CoverageCard entry={pressHeroView} onOpen={open} />);
  const article = screen.getByRole('article');
  const button = screen.getByRole('button', {
    name: 'Open ' + pressHeroView.title,
  });
  fireEvent.mouseEnter(article);
  fireEvent.mouseLeave(article);
  fireEvent.focus(button);
  fireEvent.blur(button, { relatedTarget: button });
  fireEvent.blur(button, { relatedTarget: document.body });
  fireEvent.click(button);
  expect(open).toHaveBeenCalledWith(button);
  view.rerender(
    <CoverageCard
      entry={{ ...pressHeroView, image: null, action: null, badge: 'Featured' }}
      onOpen={open}
    />,
  );
  expect(screen.getByText('Read')).toBeInTheDocument();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByText('Featured')).toBeInTheDocument();
  view.rerender(<CoverageCard entry={pressHeroView} featured onOpen={open} />);
  expect(screen.getByText(pressHeroView.description)).toBeInTheDocument();
});
