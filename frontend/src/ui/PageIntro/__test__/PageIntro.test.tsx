import { expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageIntro } from '../PageIntro.presentational';
import { voiceIntroView, IntroPreview, CMS } from '../PageIntro.stories';
import { InteriorLayout } from '../../InteriorLayout/InteriorLayout.presentational';
import { CopyKind } from '../../../domain/models/PageCopy';

it('renders shared intro semantics, multiple copy blocks, facts, and safe actions', () => {
  const view = render(<IntroPreview {...voiceIntroView} />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Voiceover',
  );
  expect(
    screen.getByRole('link', { name: 'Play voiceover reel' }),
  ).toHaveAttribute('target', '_blank');
  expect(screen.getByText('Active since')).toBeInTheDocument();
  view.rerender(
    <PageIntro
      {...voiceIntroView}
      fallbackHeading="A new page"
      blocks={[
        ...voiceIntroView.blocks,
        {
          key: 'extra',
          kind: CopyKind.Headline,
          text: 'Second headline',
          actions: null,
        },
        {
          key: 'label',
          kind: CopyKind.SectionLabel,
          text: 'Label',
          actions: null,
        },
      ]}
      action={{
        label: 'Explore',
        href: '#releases',
        isExternal: false,
        icon: 'jump',
      }}
    />,
  );
  expect(
    screen.getByRole('heading', { name: 'Second headline', level: 2 }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore' })).not.toHaveAttribute(
    'target',
  );
  view.rerender(
    <InteriorLayout
      selected
      intro={
        <PageIntro
          {...voiceIntroView}
          blocks={[]}
          fallbackHeading="Music"
          trivia={[]}
          identities={[]}
          action={null}
        />
      }
    >
      Selected detail
    </InteriorLayout>,
  );
  expect(screen.getByRole('heading', { name: 'Music' })).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('Selected detail')).toBeInTheDocument();
});

it('delegates all supported editorial intents and hides unavailable fact creation', () => {
  const settings = vi.fn(),
    addText = vi.fn(),
    addIdentity = vi.fn(),
    addFact = vi.fn();
  const controls = { disabled: false, settings, addText, addIdentity, addFact };
  const view = render(
    <PageIntro {...voiceIntroView} {...CMS.args} controls={controls} />,
  );
  for (const name of [
    'Page settings',
    'Add intro text',
    'Add identity label',
    'Add fact',
  ])
    fireEvent.click(screen.getByRole('button', { name }));
  for (const command of [settings, addText, addIdentity, addFact])
    expect(command).toHaveBeenCalledOnce();
  view.rerender(
    <PageIntro
      {...voiceIntroView}
      controls={{ ...controls, disabled: true, addFact: null }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Page settings' })).toBeDisabled();
  expect(
    screen.queryByRole('button', { name: 'Add fact' }),
  ).not.toBeInTheDocument();
  CMS.args!.controls!.settings();
  CMS.args!.controls!.addText();
  CMS.args!.controls!.addIdentity();
  CMS.args!.controls!.addFact!();
});
