import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageBoundary } from '../PageBoundary.presentational';
it('contains loading and failed pages while retaining a retry action', () => {
  const retry = vi.fn();
  const view = render(
    <PageBoundary ready={false} error={null} retry={retry}>
      Content
    </PageBoundary>,
  );
  expect(screen.getByRole('heading')).toHaveTextContent('Loading page');
  view.rerender(
    <PageBoundary ready={false} error="Offline" retry={retry}>
      Content
    </PageBoundary>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Offline');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledOnce();
  view.rerender(
    <PageBoundary ready error={null} retry={retry}>
      Content
    </PageBoundary>,
  );
  expect(view.container).toHaveTextContent('Content');
});
