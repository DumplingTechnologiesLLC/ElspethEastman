import type { Meta, StoryObj } from '@storybook/react-vite';
import { MusicPage } from './MusicPage.presentational';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { voiceIntroView } from '../../ui/PageIntro/PageIntro.stories';
import { editableView } from '../../ui/Editable/Editable.stories';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import cello from '../../assets/design/cello.png';
import rib from '../../assets/design/rib.png';
const noop = () => {};
export const musicPageView = {
  ready: true,
  error: null,
  retry: async () => {},
  intro: {
    ...voiceIntroView,
    blocks: [
      { key: 'title', kind: CopyKind.Headline, text: 'Music', actions: null },
      {
        key: 'sub',
        kind: CopyKind.Subheadline,
        text: 'Music has been a constant, even when the instrument changes.',
        actions: null,
      },
      {
        key: 'body',
        kind: CopyKind.Body,
        text: "Elspeth's work spans original albums, game soundtracks, vocals, production, piano, and now a near-daily obsession with the cello.",
        actions: null,
      },
    ],
    identities: ['Cello', 'Composition', 'Vocals'].map((label, id) => ({
      id,
      label,
      actions: null,
    })),
    trivia: [
      { id: 1, label: 'Current focus', value: 'Cello', actions: null },
      {
        id: 2,
        label: 'Practice',
        value: '2+ years · near daily',
        actions: null,
      },
      {
        id: 3,
        label: 'Current study',
        value: 'Popper · Etude No. 7',
        actions: null,
      },
    ],
    action: {
      label: 'Explore the music',
      href: '#releases',
      isExternal: false,
      icon: 'jump',
    },
  },
  practice: {
    eyebrow: 'Two years in, still climbing',
    title: 'Cello',
    description:
      'What started as learning a new instrument turned into a near-daily practice.',
    image: { url: cello, altText: 'Elspeth practicing cello' },
    facts: [
      { label: 'Playing', value: '2+ years' },
      { label: 'Current study', value: 'Popper · Etude No. 7' },
    ],
    action: {
      label: 'Watch progress',
      href: 'https://example.invalid/practice',
      isExternal: true,
    },
    actions: null,
  },
  releaseHeading: [
    {
      key: 'releases',
      kind: CopyKind.SectionLabel,
      text: 'Original music',
      actions: null,
    },
  ],
  releases: [
    {
      id: 1,
      eyebrow: '2012 · Album',
      title: 'Elspeth! The Musical',
      artworkTitle: 'Elspeth!\nThe Musical',
      description:
        'Fourteen tracks written, recorded, sung, mixed, and produced by Elspeth.',
    },
    {
      id: 2,
      eyebrow: '2013 · Album',
      title: 'Return of the Elspeth!',
      artworkTitle: 'Return of\nthe Elspeth!',
      description: 'Ten vocal tracks with original lyrics, vocals, and music.',
    },
    {
      id: 3,
      eyebrow: '2014 · Game soundtrack',
      title: 'i saw her across the world',
      artworkTitle: 'i saw her\nacross the world',
      description: 'Nine-track original soundtrack for the krangGAMES title.',
    },
    {
      id: 4,
      eyebrow: '2017 · Single',
      title: 'Miss You Again ft. JonSandman',
      artworkTitle: 'Miss You\nAgain',
      description:
        'Written, composed, and produced by Elspeth, with JonSandman as guest writer.',
    },
  ].map((row) => ({
    ...row,
    image: { url: rib, altText: 'Ribbed amber abstract artwork' },
    action: {
      label: 'Listen',
      href: 'https://example.invalid/release',
      isExternal: true,
    },
    actions: null,
  })),
  controls: null,
} satisfies Parameters<typeof MusicPage>[0];
export function MusicPreview(props: Parameters<typeof MusicPage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      title="Music · Elspeth Eastman"
      pageId={3}
      pageKind={PageKind.Music}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      pages={{
        ...portfolioView.pages,
        [PageKind.Music]: <MusicPage {...props} />,
      }}
    />
  );
}
const meta = {
  component: MusicPage,
  args: musicPageView,
  render: MusicPreview,
  excludeStories: /.*View$|.*Preview$/,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof MusicPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: {
    practice: { ...musicPageView.practice, actions: editableView },
    releases: musicPageView.releases.map((row) => ({
      ...row,
      actions: editableView,
    })),
    controls: { disabled: false, add: noop, addReleaseHeading: noop },
  },
};
export const Empty: StoryObj<typeof meta> = {
  args: { releases: [], practice: { ...musicPageView.practice, facts: [] } },
};
