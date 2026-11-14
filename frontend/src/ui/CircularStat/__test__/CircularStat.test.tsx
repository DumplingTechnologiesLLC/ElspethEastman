import { it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CircularStat } from '../CircularStat.presentational';
import { observers, frames, canvasContext } from '../../../../../test/dom';
it('draws the background, animates progress only when visible, and releases DOM resources', () => {
  const view = render(
    <CircularStat value="10+" label="Projects" percent={70} />,
  );
  expect(screen.getByText('Projects')).toBeInTheDocument();
  act(() => observers[0]!.trigger(0));
  act(() => observers[0]!.trigger(1));
  for (let index = 0; index < frames.length && index < 210; index++)
    act(() => frames[index]!(0));
  expect(canvasContext.arc).toHaveBeenCalledWith(
    100,
    100,
    87.5,
    Math.PI * 1.5,
    expect.any(Number),
  );
  expect(cancelAnimationFrame).toHaveBeenCalled();
  view.unmount();
  expect(observers[0]!.unobserve).toHaveBeenCalledOnce();
});
it('renders labels when the browser has no 2D canvas context', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  render(<CircularStat value="0" label="Projects" percent={0} />);
  expect(screen.getByText('0')).toBeInTheDocument();
});
