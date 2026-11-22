import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamingPage } from '../StreamingPage.presentational';
import {
  streamingPageView,
  StreamingPreview,
  CMS,
} from '../StreamingPage.stories';
it('presents the hero and separate streams/clips through public and CMS states', () => {
  const view = render(<StreamingPreview {...streamingPageView} />);
  expect(
    screen.getByRole('heading', { name: 'Collab with @TheNormiesTV' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Play clip' })).toHaveLength(2);
  const addStream = vi.fn(),
    addClip = vi.fn(),
    addStreamHeading = vi.fn(),
    addClipHeading = vi.fn();
  view.rerender(
    <StreamingPage
      {...streamingPageView}
      {...CMS.args}
      controls={{
        disabled: false,
        addStream,
        addClip,
        addStreamHeading,
        addClipHeading,
      }}
    />,
  );
  for (const name of [
    'Add stream',
    'Add clip',
    'Add streams heading',
    'Add clips heading',
  ])
    fireEvent.click(screen.getByRole('button', { name }));
  for (const callback of [addStream, addClip, addStreamHeading, addClipHeading])
    expect(callback).toHaveBeenCalledOnce();
  view.rerender(
    <StreamingPage
      {...streamingPageView}
      intro={null}
      featured={null}
      rows={[]}
      clips={[]}
    />,
  );
  expect(
    screen.getByText('Recent streams will appear here.'),
  ).toBeInTheDocument();
  expect(screen.getByText('Clips will appear here.')).toBeInTheDocument();
  void streamingPageView.retry();
  for (const callback of Object.values(CMS.args!.controls!))
    if (typeof callback === 'function') callback();
});
