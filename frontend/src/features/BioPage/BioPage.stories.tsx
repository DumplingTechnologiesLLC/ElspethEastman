import type { Meta, StoryObj } from '@storybook/react-vite';
import { BioPage } from './BioPage.presentational';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { voiceIntroView } from '../../ui/PageIntro/PageIntro.stories';
import { editableView } from '../../ui/Editable/Editable.stories';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import portrait from '../../assets/design/bio-portrait.png';
const noop = () => {};
export const bioPageView = {
  ready: true,
  error: null,
  retry: async () => {},
  intro: {
    ...voiceIntroView,
    blocks: [
      { key: 'title', kind: CopyKind.Headline, text: 'Bio', actions: null },
      {
        key: 'sub',
        kind: CopyKind.Subheadline,
        text: 'A career built sideways, one interesting detour at a time.',
        actions: null,
      },
      {
        key: 'body',
        kind: CopyKind.Body,
        text: 'Elspeth Eastman is a voice actor, streamer, and musician whose work has moved between games, live entertainment, original music, and whatever new instrument has her attention.',
        actions: null,
      },
    ],
    identities: ['Voice actor', 'Streamer', 'Musician'].map((label, id) => ({
      id: `00000000-0000-4000-8000-${id.toString(16).padStart(12, '0')}`,
      label,
      actions: null,
    })),
    trivia: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        label: 'Started with',
        value: 'Theater · YouTube',
        actions: null,
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        label: 'Breakthrough',
        value: 'Tristana · Riot Games',
        actions: null,
      },
      {
        id: '00000000-0000-4000-8000-000000000003',
        label: 'Currently',
        value: 'VO · Streaming · Cello',
        actions: null,
      },
    ],
    action: null,
  },
  portrait: {
    url: portrait,
    altText: 'Portrait of Elspeth Eastman',
    caption: '',
    actions: null,
  },
  biography: [
    {
      key: 'short-heading',
      kind: CopyKind.Headline,
      text: 'Theater kid. Internet voice experiments. One very consequential League of Legends video.',
      actions: null,
    },
    {
      key: 'short-body',
      kind: CopyKind.Body,
      text: 'Elspeth grew up in rural northern Indiana, spent her school years around theater, and began experimenting with voice work while in college. What started as a side project on YouTube eventually became a professional career spanning voice acting, streaming, music, and live appearances.',
      actions: null,
    },
  ],
  storyHeading: [
    {
      key: 'story',
      kind: CopyKind.SectionLabel,
      text: 'How I got here',
      actions: null,
    },
  ],
  currentHeading: [
    {
      key: 'current',
      kind: CopyKind.SectionLabel,
      text: 'Currently',
      actions: null,
    },
  ],
  exploreHeading: [
    {
      key: 'explore',
      kind: CopyKind.SectionLabel,
      text: 'Explore the work',
      actions: null,
    },
  ],
  chapters: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      eyebrow: 'Early years',
      heading: 'From theater to a microphone in a closet.',
      body: 'Growing up in northern Indiana, Elspeth gravitated toward performance early through school theater. In college, voice acting became a side hobby: recording character voices, posting experiments online, and learning the craft by doing it.',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      eyebrow: 'The turn',
      heading: 'YouTube found its way to Riot.',
      body: 'In 2013, Elspeth posted a video voicing League of Legends champions. Riot employees found it, passed it around internally, and later invited her to audition for Tristana. She recorded the audition at home, landed the role, and the credit became a major turning point into professional voice work.',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      eyebrow: 'More than one lane',
      heading: 'Voice acting was never the only thing.',
      body: "Alongside character work, Elspeth has composed, produced, sung, streamed, hosted, and appeared at events and panels. Streaming grew from another creative outlet into a long-running career of its own, including recognition as one of Twitch's original Ambassador cohort.",
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      eyebrow: 'Now',
      heading: 'The current obsession has four strings.',
      body: 'Today the mix still changes. Voice work and streaming continue, while cello has become the most visible musical focus: near-daily practice, increasingly serious repertoire, and a running record of what progress actually looks like.',
    },
  ].map((row) => ({ ...row, actions: null })),
  current: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      eyebrow: 'Voice acting',
      title: 'Games & animation',
      description: 'Character-forward performance and recurring roles.',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      eyebrow: 'Streaming',
      title: 'Variety & live chaos',
      description: 'Games, roleplay, collaborations, and conversation.',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      eyebrow: 'Music',
      title: 'Cello',
      description: 'Two-plus years of near-daily practice and counting.',
    },
  ].map((row) => ({ ...row, link: null, actions: null })),
  explore: [
    {
      id: '00000000-0000-4000-8000-000000000002',
      label: 'Voiceover',
      href: '/voiceover',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      label: 'Music',
      href: '/music',
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      label: 'Streaming',
      href: '/streaming',
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      label: 'Press',
      href: '/press',
    },
  ],
  navigate: noop,
  controls: null,
} satisfies Parameters<typeof BioPage>[0];
export function BioPreview(props: Parameters<typeof BioPage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      title="Bio · Elspeth Eastman"
      pageId={'00000000-0000-4000-8000-000000000006'}
      pageKind={PageKind.Bio}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      pages={{ ...portfolioView.pages, [PageKind.Bio]: <BioPage {...props} /> }}
    />
  );
}
const meta = {
  component: BioPage,
  args: bioPageView,
  render: BioPreview,
  excludeStories: /.*View$|.*Preview$/,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof BioPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: {
    portrait: { ...bioPageView.portrait, actions: editableView },
    biography: bioPageView.biography.map((row) => ({
      ...row,
      actions: editableView,
    })),
    chapters: bioPageView.chapters.map((row) => ({
      ...row,
      actions: editableView,
    })),
    current: bioPageView.current.map((row) => ({
      ...row,
      actions: editableView,
    })),
    controls: {
      disabled: false,
      addBiography: noop,
      addChapter: noop,
      addCurrent: noop,
      addStoryHeading: noop,
      addCurrentHeading: noop,
      addExploreHeading: noop,
    },
  },
};
export const Empty: StoryObj<typeof meta> = {
  args: { chapters: [], current: [] },
};
