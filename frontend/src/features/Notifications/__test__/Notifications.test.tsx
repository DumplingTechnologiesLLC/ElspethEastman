import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Notifications } from '../Notifications.presentational';
it('renders every notification flavor with announcement priority and optional titles', () => {
  render(
    <Notifications
      toasts={(['info', 'error', 'warning', 'success'] as const).map(
        (flavor, index) => ({
          id: index,
          flavor,
          title: index ? 'Title' : '',
          content: flavor,
        }),
      )}
    />,
  );
  expect(screen.getAllByRole('alert')).toHaveLength(4);
  expect(screen.getByText('info').closest('[role="alert"]')).toHaveAttribute(
    'aria-live',
    'polite',
  );
  expect(screen.getByText('error').closest('[role="alert"]')).toHaveAttribute(
    'aria-live',
    'assertive',
  );
});
