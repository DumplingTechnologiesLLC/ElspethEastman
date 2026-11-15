import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Video } from '../Video.presentational';
const props = {
  title: 'Preview',
  thumbnail: '/thumbnail.png',
  embed: 'https://www.youtube.com/embed/example',
};
it('loads the embed on overlay click and responds to hover and focus', () => {
  render(<Video {...props} />);
  const loader = screen.getByLabelText('Video Loader: Preview');
  for (const event of [
    fireEvent.mouseEnter,
    fireEvent.mouseLeave,
    fireEvent.focus,
    fireEvent.blur,
  ])
    event(loader);
  fireEvent.keyUp(loader, { key: 'Escape' });
  expect(screen.queryByTitle('Embedded Youtube Video: Preview')).toBeNull();
  fireEvent.click(loader);
  expect(screen.getByTitle('Embedded Youtube Video: Preview')).toHaveAttribute(
    'src',
    props.embed,
  );
});
it.each(['overlay', 'thumbnail'])('loads with Enter from the %s', (target) => {
  render(<Video {...props} block />);
  const element =
    target === 'overlay'
      ? screen.getByLabelText('Video Loader: Preview')
      : screen.getByAltText('Select this thumbnail to load Preview');
  fireEvent.keyUp(element, { key: 'Escape' });
  fireEvent.keyUp(element, { key: 'Enter' });
  expect(
    screen.getByTitle('Embedded Youtube Video: Preview'),
  ).toBeInTheDocument();
});
it('also loads when the thumbnail itself is clicked', () => {
  render(<Video {...props} />);
  fireEvent.click(screen.getByAltText('Select this thumbnail to load Preview'));
  expect(
    screen.getByTitle('Embedded Youtube Video: Preview'),
  ).toBeInTheDocument();
});
