import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceoverPage } from './VoiceoverPage.presentational';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { voiceIntroView } from '../../ui/PageIntro/PageIntro.stories';
import { tristanaView } from '../../ui/WorkCard/WorkCard.stories';
import { editableView } from '../../ui/Editable/Editable.stories';
import { PageKind } from '../../domain/models/Page';
import { CopyKind } from '../../domain/models/PageCopy';
import cadence from '../../assets/design/cadence.png';
import nori from '../../assets/design/nori.png';
import enatsu from '../../assets/design/enatsu.png';
const noop = () => {};
export const voiceoverPageView = {
  ready: true,
  error: null,
  retry: async () => {},
  intro: voiceIntroView,
  section: [
    {
      key: 'roles-label',
      kind: CopyKind.SectionLabel,
      text: 'Featured roles',
      actions: null,
    },
  ],
  rows: [
    tristanaView,
    {
      ...tristanaView,
      id: '00000000-0000-4000-8000-00000000002a',
      title: 'Cadence',
      eyebrow: 'NecroDancer franchise',
      description:
        'From Crypt of the NecroDancer through Cadence of Hyrule and Rift of the NecroDancer.',
      image: {
        url: cadence,
        altText: 'Cadence from Crypt of the NecroDancer',
        caption: '',
      },
    },
    {
      ...tristanaView,
      id: '00000000-0000-4000-8000-00000000002b',
      title: 'Nori Kaga',
      eyebrow: 'Cook Serve Forever',
      description:
        "Lead performance in Vertigo Gaming's fully voiced narrative cooking adventure.",
      image: {
        url: nori,
        altText: 'Nori Kaga from Cook Serve Forever',
        caption: '',
      },
    },
    {
      ...tristanaView,
      id: '00000000-0000-4000-8000-00000000002c',
      title: 'Major Enatsu',
      eyebrow: 'Gamera -Rebirth-',
      description:
        "English-language animation credit for Netflix's Gamera series.",
      image: {
        url: enatsu,
        altText: 'Major Enatsu from Gamera Rebirth',
        caption: '',
      },
    },
  ],
  featured: null,
  selected: null,
  open: noop,
  close: noop,
  controls: null,
} satisfies Parameters<typeof VoiceoverPage>[0];
export function VoiceoverPreview(props: Parameters<typeof VoiceoverPage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      title="Voiceover · Elspeth Eastman"
      pageId="00000000-0000-4000-8000-000000000002"
      pageKind={PageKind.Voiceover}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      pages={{
        ...portfolioView.pages,
        [PageKind.Voiceover]: <VoiceoverPage {...props} />,
      }}
    />
  );
}
const meta = {
  component: VoiceoverPage,
  args: voiceoverPageView,
  render: VoiceoverPreview,
  excludeStories: /.*View$|.*Preview$/,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof VoiceoverPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Selected: StoryObj<typeof meta> = {
  args: { selected: tristanaView },
};
export const Featured: StoryObj<typeof meta> = {
  args: { featured: tristanaView, rows: voiceoverPageView.rows.slice(1) },
};
export const CMS: StoryObj<typeof meta> = {
  args: {
    rows: voiceoverPageView.rows.map((row) => ({
      ...row,
      actions: editableView,
    })),
    controls: { disabled: false, add: noop, addHeading: noop },
  },
};
export const Empty: StoryObj<typeof meta> = { args: { rows: [] } };
