import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomePage } from './HomePage.presentational';
import { ContactForm } from '../ContactForm/ContactForm.presentational';
import { contactFormView } from '../ContactForm/ContactForm.stories';
import { CopyKind } from '../../domain/models/PageCopy';
import portrait from '../../assets/design/home-portrait.png';
import { editableView } from '../../ui/Editable/Editable.stories';
import { Portfolio } from '../Portfolio/Portfolio.presentational';
import { portfolioView } from '../Portfolio/Portfolio.stories';
import { PageKind } from '../../domain/models/Page';
const noop = () => {};
export const homePageView = {
  ready: true,
  error: null,
  retry: async () => {},
  blocks: [
    {
      key: 'headline',
      kind: CopyKind.Headline,
      text: 'A distinctive voice for stories, games, streams, and whatever strange thing comes next.',
      actions: null,
    },
    {
      key: 'body',
      kind: CopyKind.Body,
      text: 'Elspeth works across voice performance, live entertainment, and music, bringing character, timing, and an actual point of view to the work. For casting, collaborations, appearances, music projects, or something that refuses to fit neatly into a category, reach out.',
      actions: null,
    },
  ],
  identities: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      label: 'Voice actor',
      actions: null,
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      label: 'Streamer',
      actions: null,
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      label: 'Musician',
      actions: null,
    },
  ],
  image: {
    url: portrait,
    altText: 'Elspeth Eastman smiling in the studio',
    caption: '',
    actions: null,
  },
  controls: null,
  contact: <ContactForm {...contactFormView} />,
} satisfies Parameters<typeof HomePage>[0];
export function HomePagePreview(props: Parameters<typeof HomePage>[0]) {
  return (
    <Portfolio
      {...portfolioView}
      editor={props.controls !== null}
      authenticated={props.controls !== null}
      links={portfolioView.links.map((link) => ({ ...link, active: false }))}
      pages={{
        ...portfolioView.pages,
        [PageKind.Home]: <HomePage {...props} />,
      }}
    />
  );
}
const meta = {
  component: HomePage,
  excludeStories: /.*View$|.*Preview$/,
  args: homePageView,
  render: HomePagePreview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof HomePage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: {
    blocks: homePageView.blocks.map((block) => ({
      ...block,
      actions: editableView,
    })),
    identities: homePageView.identities.map((identity) => ({
      ...identity,
      actions: editableView,
    })),
    image: { ...homePageView.image, actions: editableView },
    controls: {
      disabled: false,
      settings: noop,
      addText: noop,
      addIdentity: noop,
    },
  },
};
export const Loading: StoryObj<typeof meta> = { args: { ready: false } };
