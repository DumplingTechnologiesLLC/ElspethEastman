import type { Meta, StoryObj } from '@storybook/react-vite';
import { PressPage } from './PressPage.presentational';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { voiceIntroView } from '../../ui/PageIntro/PageIntro.stories';
import { tristanaView } from '../../ui/WorkCard/WorkCard.stories';
import { editableView } from '../../ui/Editable/Editable.stories';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import health from '../../assets/design/press-health.png';
import podcast from '../../assets/design/press-podcast.png';
import geekenders from '../../assets/design/press-geekenders.png';
import dignitas from '../../assets/design/press-dignitas.png';
import tubefilter from '../../assets/design/press-tubefilter.png';
const noop = () => {};
export const pressHeroView = {
  ...tristanaView,
  id: 1,
  title: 'The Patrick Scott Patterson Project',
  eyebrow: 'Podcast · Featured interview',
  description:
    'Long-form conversation on voice acting, games, Twitch, music, and career evolution.',
  image: {
    url: podcast,
    altText: 'The Patrick Scott Patterson Project interview',
    caption: '',
  },
  metadata: [
    {
      key: 'outlet',
      label: 'Publication',
      value: 'The Patrick Scott Patterson Project',
    },
  ],
  outlet: 'The Patrick Scott Patterson Project',
  category: 'Podcast',
  publication: 'April 4, 2026',
  action: {
    label: 'Listen',
    href: 'https://example.invalid/podcast',
    isExternal: true,
  },
};
export const pressPageView = {
  ready: true,
  error: null,
  retry: async () => {},
  intro: {
    ...voiceIntroView,
    blocks: [
      { key: 'title', kind: CopyKind.Headline, text: 'Press', actions: null },
      {
        key: 'sub',
        kind: CopyKind.Subheadline,
        text: 'A decade of conversations, coverage, panels, and public appearances.',
        actions: null,
      },
      {
        key: 'body',
        kind: CopyKind.Body,
        text: "From voice acting and streaming to music and the stranger corners of internet culture, Elspeth's work has generated a substantial external media trail.",
        actions: null,
      },
    ],
    identities: ['Interviews', 'Features', 'Appearances'].map((label, id) => ({
      id,
      label,
      actions: null,
    })),
    trivia: [
      { id: 1, label: 'Coverage since', value: '2013', actions: null },
      { id: 2, label: 'Formats', value: 'Interview · Feature', actions: null },
      { id: 3, label: 'Appearances', value: 'Panels · Events', actions: null },
    ],
    action: {
      label: 'Latest interview',
      href: 'https://example.invalid/interview',
      isExternal: true,
      icon: 'external',
    },
  },
  coverageHeading: [
    {
      key: 'coverage',
      kind: CopyKind.SectionLabel,
      text: 'Interviews & features',
      actions: null,
    },
  ],
  appearanceHeading: [
    {
      key: 'appearances',
      kind: CopyKind.SectionLabel,
      text: 'Appearances',
      actions: null,
    },
  ],
  featured: pressHeroView,
  selected: null,
  open: noop,
  close: noop,
  entries: [
    {
      id: 2,
      title: 'Finding her voice again',
      eyebrow: 'Feature',
      outlet: 'UC Health',
      category: 'Health / voice',
      image: {
        url: health,
        altText: 'Elspeth in a UC Health feature',
        caption: '',
      },
      action: {
        label: 'Read',
        href: 'https://example.invalid/health',
        isExternal: true,
      },
    },
    {
      id: 3,
      title: 'Chatting with Elspeth',
      eyebrow: 'Podcast',
      outlet: 'The Geekenders',
      category: 'Conversation',
      image: {
        url: geekenders,
        altText: 'The Geekenders podcast',
        caption: '',
      },
      action: {
        label: 'Listen',
        href: 'https://example.invalid/geekenders',
        isExternal: true,
      },
    },
    {
      id: 4,
      title: 'On becoming Tristana',
      eyebrow: 'Interview',
      outlet: 'Dignitas',
      category: 'League / voice',
      image: { url: dignitas, altText: 'Tristana interview', caption: '' },
      action: {
        label: 'Read',
        href: 'https://example.invalid/dignitas',
        isExternal: true,
      },
    },
    {
      id: 5,
      title: 'CAA signs gaming creators',
      eyebrow: 'Coverage',
      outlet: 'Tubefilter',
      category: 'Industry / creators',
      image: {
        url: tubefilter,
        altText: 'Gaming creators featured by Tubefilter',
        caption: '',
      },
      action: {
        label: 'Read',
        href: 'https://example.invalid/tubefilter',
        isExternal: true,
      },
    },
  ].map((row) => ({
    ...pressHeroView,
    ...row,
    metadata: [{ key: 'outlet', label: 'Publication', value: row.outlet }],
  })),
  appearances: [
    {
      id: 1,
      year: '2026',
      title: 'MAGFest · Voice Actor Round Table',
      format: 'Panel',
      url: null,
    },
    {
      id: 2,
      year: '2024',
      title: 'The Geekenders',
      format: 'Podcast',
      url: 'https://example.invalid/geekenders',
    },
    {
      id: 3,
      year: '2023',
      title: 'UC Health patient feature',
      format: 'Feature',
      url: null,
    },
    {
      id: 4,
      year: '2016',
      title: 'White House Gaming Healthcare Event',
      format: 'Appearance',
      url: null,
    },
    {
      id: 5,
      year: '2013',
      title: 'WNIT · Experience Michiana',
      format: 'Performance',
      url: null,
    },
  ].map((row) => ({ ...row, actions: null })),
  controls: null,
} satisfies Parameters<typeof PressPage>[0];
export function PressPreview(props: Parameters<typeof PressPage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      title="Press · Elspeth Eastman"
      pageId={5}
      pageKind={PageKind.Press}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      pages={{
        ...portfolioView.pages,
        [PageKind.Press]: <PressPage {...props} />,
      }}
    />
  );
}
const meta = {
  component: PressPage,
  args: pressPageView,
  render: PressPreview,
  excludeStories: /.*View$|.*Preview$/,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof PressPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Selected: StoryObj<typeof meta> = {
  args: { selected: pressHeroView },
};
export const CMS: StoryObj<typeof meta> = {
  args: {
    featured: { ...pressHeroView, badge: 'Featured', actions: editableView },
    entries: [pressHeroView, ...pressPageView.entries].map((row) => ({
      ...row,
      actions: editableView,
    })),
    appearances: pressPageView.appearances.map((row) => ({
      ...row,
      actions: editableView,
    })),
    controls: {
      disabled: false,
      addCoverage: noop,
      addAppearance: noop,
      addCoverageHeading: noop,
      addAppearanceHeading: noop,
    },
  },
};
export const Empty: StoryObj<typeof meta> = {
  args: { featured: null, entries: [], appearances: [] },
};
