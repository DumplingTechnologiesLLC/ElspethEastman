import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextCard } from '../TextCard.presentational';
import { streamingPageView } from '../../../features/StreamingPage/StreamingPage.stories';
it('renders optional metadata and destinations without coupling clip cards to entries', () => {
  const entry = streamingPageView.rows[0]!;
  const view = render(
    <TextCard
      entry={{
        ...entry,
        description: 'Current work',
        badge: 'Featured',
        action: { label: 'Visit', href: '#inside', isExternal: false },
      }}
    />,
  );
  expect(screen.getByRole('link', { name: 'Visit' })).not.toHaveAttribute(
    'target',
  );
  expect(screen.getByText('Current work')).toBeInTheDocument();
  expect(screen.getByText('Featured')).toBeInTheDocument();
  view.rerender(
    <TextCard entry={{ ...entry, category: null, action: null }} compact />,
  );
  expect(screen.queryByRole('link')).toBeNull();
});
