import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreamingPage } from './StreamingPage.presentational';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { voiceIntroView } from '../../ui/PageIntro/PageIntro.stories';
import { tristanaView } from '../../ui/WorkCard/WorkCard.stories';
import { editableView } from '../../ui/Editable/Editable.stories';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import stream from '../../assets/design/stream.png';
const noop = () => {};
const action = {
  label: 'Watch VOD',
  href: 'https://example.invalid/stream',
  isExternal: true,
};
export const streamingPageView = {
  ready: true,
  error: null,
  retry: async () => {},
  intro: {
    ...voiceIntroView,
    blocks: [
      {
        key: 'title',
        kind: CopyKind.Headline,
        text: 'Streaming',
        actions: null,
      },
      {
        key: 'sub',
        kind: CopyKind.Subheadline,
        text: 'Games are involved. Things generally deteriorate from there.',
        actions: null,
      },
      {
        key: 'body',
        kind: CopyKind.Body,
        text: 'Elspeth has spent more than a decade streaming variety games, roleplay, collaborations, and whatever else seemed like a good idea at the time.',
        actions: null,
      },
    ],
    identities: ['Partner', 'Ambassador', 'Variety'].map((label, id) => ({
      id,
      label,
      actions: null,
    })),
    trivia: [
      { id: 1, label: 'Status', value: 'Partner · Ambassador', actions: null },
      { id: 2, label: 'Streaming since', value: '2014', actions: null },
      { id: 3, label: 'Audience', value: '181K+ followers', actions: null },
    ],
    action: {
      label: 'Watch on Twitch',
      href: 'https://example.invalid/twitch',
      isExternal: true,
      icon: 'stream',
    },
  },
  streamHeading: [
    {
      key: 'streams',
      kind: CopyKind.SectionLabel,
      text: 'Recent streams',
      actions: null,
    },
  ],
  clipHeading: [
    { key: 'clips', kind: CopyKind.SectionLabel, text: 'Clips', actions: null },
  ],
  featured: {
    ...tristanaView,
    id: 1,
    title: 'Collab with @TheNormiesTV',
    eyebrow: 'Latest stream · Collaboration',
    description: 'Joining the push toward one million subscribers.',
    image: {
      url: stream,
      altText: 'Elspeth collaborating with The Normies',
      caption: '',
    },
    metadata: [],
    action: null,
  },
  rows: [
    {
      id: 2,
      title: 'gonna find what was tryna eat me today',
      eyebrow: 'Subnautica 2',
      category: 'Recent stream',
    },
    {
      id: 3,
      title: 'Meccha Chameleon with pals',
      eyebrow: 'Meccha Chameleon',
      category: 'Recent stream',
    },
    {
      id: 4,
      title: 'Hookworm Sally',
      eyebrow: 'Wayward RP · Red Dead Redemption II',
      category: 'Roleplay',
    },
  ].map((row) => ({
    ...row,
    description: null,
    action,
    badge: null,
    actions: null,
  })),
  clips: [
    { id: 5, title: 'Elspeth finds the no-no Square' },
    { id: 6, title: 'Elspeth puts a rude viewer in their place' },
  ].map((row) => ({
    ...row,
    eyebrow: 'Clip',
    description: null,
    category: null,
    action: { ...action, label: 'Play clip' },
    badge: null,
    actions: null,
  })),
  controls: null,
} satisfies Parameters<typeof StreamingPage>[0];
export function StreamingPreview(props: Parameters<typeof StreamingPage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      title="Streaming · Elspeth Eastman"
      pageId={4}
      pageKind={PageKind.Streaming}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      pages={{
        ...portfolioView.pages,
        [PageKind.Streaming]: <StreamingPage {...props} />,
      }}
    />
  );
}
const meta = {
  component: StreamingPage,
  args: streamingPageView,
  render: StreamingPreview,
  excludeStories: /.*View$|.*Preview$/,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof StreamingPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: {
    featured: { ...streamingPageView.featured, actions: editableView },
    rows: streamingPageView.rows.map((row) => ({
      ...row,
      actions: editableView,
    })),
    clips: streamingPageView.clips.map((row) => ({
      ...row,
      actions: editableView,
    })),
    controls: {
      disabled: false,
      addStream: noop,
      addClip: noop,
      addStreamHeading: noop,
      addClipHeading: noop,
    },
  },
};
export const Empty: StoryObj<typeof meta> = {
  args: { featured: null, rows: [], clips: [] },
};
