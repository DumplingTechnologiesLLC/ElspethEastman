import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceoverPage } from '../VoiceoverPage.presentational';
import {
  voiceoverPageView,
  VoiceoverPreview,
  CMS,
} from '../VoiceoverPage.stories';
import { CopyKind } from '../../../domain/models/PageCopy';

it('opens loaded entries and restores focus to the recreated originating card', () => {
  const open = vi.fn(),
    close = vi.fn();
  const view = render(
    <VoiceoverPage {...voiceoverPageView} open={open} close={close} />,
  );
  const origin = screen.getByRole('button', { name: 'Open Cadence' });
  origin.focus();
  fireEvent.click(origin);
  expect(open).toHaveBeenCalledWith(42);
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      open={open}
      close={close}
      selected={voiceoverPageView.rows[1]!}
    />,
  );
  expect(document.activeElement).toBe(
    screen.getByRole('region', { name: 'Cadence' }),
  );
  const closeButton = screen.getByRole('button', { name: 'Close detail' });
  closeButton.focus();
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      selected={{ ...voiceoverPageView.rows[1]!, title: 'Updated Cadence' }}
      section={[]}
      close={close}
    />,
  );
  expect(document.activeElement).toBe(closeButton);
  fireEvent.click(screen.getByRole('button', { name: 'Close detail' }));
  expect(close).toHaveBeenCalledOnce();
  view.rerender(
    <VoiceoverPage {...voiceoverPageView} open={open} close={close} />,
  );
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Open Cadence' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Cadence' }));
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      ready={false}
      selected={voiceoverPageView.rows[1]!}
    />,
  );
  view.rerender(<VoiceoverPage {...voiceoverPageView} ready={false} />);
  expect(screen.getByRole('heading')).toHaveTextContent('Loading page');
});

it('falls back to the grid when the selected entry was deleted or detail opened directly', () => {
  const view = render(
    <VoiceoverPage
      {...voiceoverPageView}
      selected={voiceoverPageView.rows[0]!}
    />,
  );
  view.rerender(<VoiceoverPage {...voiceoverPageView} />);
  expect(document.activeElement).toBe(
    screen.getByRole('region', { name: 'Roles' }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Tristana' }));
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      selected={voiceoverPageView.rows[0]!}
    />,
  );
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      rows={voiceoverPageView.rows.slice(1)}
    />,
  );
  expect(document.activeElement).toBe(
    screen.getByRole('region', { name: 'Roles' }),
  );
});

it('composes featured, CMS, loading and empty states through the same page frame', async () => {
  const open = vi.fn(),
    add = vi.fn(),
    addHeading = vi.fn();
  const view = render(
    <VoiceoverPage
      {...voiceoverPageView}
      featured={voiceoverPageView.rows[0]!}
      rows={[]}
      open={open}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Tristana' }));
  expect(open).toHaveBeenCalledWith(40);
  view.rerender(
    <VoiceoverPreview
      {...voiceoverPageView}
      {...CMS.args}
      controls={{ disabled: false, add, addHeading }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add role' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add section heading' }));
  expect(add).toHaveBeenCalledOnce();
  expect(addHeading).toHaveBeenCalledOnce();
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      rows={[]}
      section={[
        {
          key: 'section',
          kind: CopyKind.SectionLabel,
          text: 'Roles',
          actions: null,
        },
      ]}
    />,
  );
  expect(screen.getByText('Roles will appear here.')).toBeInTheDocument();
  view.rerender(
    <VoiceoverPage
      {...voiceoverPageView}
      ready={false}
      intro={null}
      selected={voiceoverPageView.rows[0]!}
    />,
  );
  view.rerender(
    <VoiceoverPage {...voiceoverPageView} ready={false} intro={null} />,
  );
  expect(screen.getByRole('heading')).toHaveTextContent('Loading page');
  voiceoverPageView.open();
  voiceoverPageView.close();
  CMS.args!.controls!.add();
  CMS.args!.controls!.addHeading();
  await voiceoverPageView.retry();
});
