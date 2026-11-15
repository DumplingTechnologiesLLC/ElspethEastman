import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../HomePage.presentational';
import { HomePagePreview, homePageView, CMS } from '../HomePage.stories';
import { CopyKind } from '../../../domain/models/PageCopy';

it('renders the responsive Home composition and retained contact as a slot', () => {
  const view = render(<HomePagePreview {...homePageView} />);
  expect(
    screen.getByRole('heading', { name: 'Elspeth Eastman' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('img', { name: 'Elspeth Eastman smiling in the studio' }),
  ).toHaveAttribute('src', homePageView.image.url);
  expect(
    screen.getByRole('form', { name: 'Contact Elspeth' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Voice actor')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Add text' }),
  ).not.toBeInTheDocument();
  view.rerender(
    <HomePage
      {...homePageView}
      blocks={[
        ...homePageView.blocks,
        {
          key: 'sub',
          kind: CopyKind.Subheadline,
          text: 'Subheadline',
          actions: null,
        },
        {
          key: 'label',
          kind: CopyKind.SectionLabel,
          text: 'Section',
          actions: null,
        },
        {
          key: 'plain',
          kind: CopyKind.Body,
          text: '<b>Plain text</b>',
          actions: null,
        },
      ]}
      contact={<p>Contact slot</p>}
    />,
  );
  expect(
    screen.getByRole('heading', { name: 'Subheadline', level: 3 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Section' })).toBeInTheDocument();
  expect(view.container.querySelector('b')).toBeNull();
  expect(screen.getByText('<b>Plain text</b>')).toBeInTheDocument();
  view.rerender(
    <HomePage {...homePageView} image={null} identities={[]} contact={null} />,
  );
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  view.rerender(<HomePage {...homePageView} ready={false} contact={null} />);
  expect(screen.getByRole('heading')).toHaveTextContent('Loading page');
});

it('delegates CMS intents while keeping the same public content', () => {
  const settings = vi.fn(),
    addText = vi.fn(),
    addIdentity = vi.fn(),
    edit = vi.fn();
  const controls = { disabled: false, settings, addText, addIdentity };
  const view = render(
    <HomePage
      {...homePageView}
      {...CMS.args}
      controls={controls}
      image={{
        ...homePageView.image,
        actions: { ...CMS.args!.image!.actions!, edit },
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Page settings' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add text' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add identity label' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit hero image' }));
  for (const command of [settings, addText, addIdentity, edit])
    expect(command).toHaveBeenCalledOnce();
  view.rerender(<HomePagePreview {...homePageView} {...CMS.args} />);
  expect(screen.getByText('Content editor')).toBeInTheDocument();
  CMS.args!.controls!.settings();
  CMS.args!.controls!.addText();
  CMS.args!.controls!.addIdentity();
});

it('runs its isolated retry story callback', async () => {
  await homePageView.retry();
});
