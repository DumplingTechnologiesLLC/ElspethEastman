import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkDetail } from '../WorkDetail.presentational';
import meta from '../WorkDetail.stories';
import { tristanaView } from '../../WorkCard/WorkCard.stories';
it('renders canonical metadata, contextual imagery, optional publication/action, and close', () => {
  const close = vi.fn();
  const view = render(<WorkDetail entry={tristanaView} onClose={close} />);
  expect(screen.getByRole('heading', { name: 'Tristana' })).toBeInTheDocument();
  expect(screen.getByText('Details')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close detail' }));
  expect(close).toHaveBeenCalledOnce();
  view.rerender(
    <WorkDetail
      entry={{
        ...tristanaView,
        image: { ...tristanaView.image!, caption: 'In character' },
        publication: 'November 15, 2026',
      }}
      onClose={close}
    />,
  );
  expect(screen.getByText('In character')).toBeInTheDocument();
  expect(screen.getByText('November 15, 2026')).toBeInTheDocument();
  view.rerender(
    <WorkDetail
      entry={{ ...tristanaView, image: null, action: null, metadata: [] }}
      onClose={close}
    />,
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  meta.args.onClose();
});
