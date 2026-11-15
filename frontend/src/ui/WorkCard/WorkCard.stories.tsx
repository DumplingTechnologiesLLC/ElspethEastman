import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkCard } from './WorkCard.presentational';
import type { WorkEntryView } from '../../application/viewModels/WorkEntryView';
import tristana from '../../assets/design/tristana.png';
import { withSurface } from '../../stories/withSurface';
export const tristanaView: WorkEntryView = {
  id: 40,
  title: 'Tristana',
  eyebrow: 'League of Legends',
  description:
    "One of Elspeth's most recognizable long-running game roles, including Dragon Trainer Tristana.",
  image: {
    url: tristana,
    altText: 'Tristana from League of Legends',
    caption: '',
  },
  metadata: [
    {
      key: 'details',
      label: 'Details',
      value: 'League of Legends · 2015–present',
    },
  ],
  action: {
    label: 'Project / clip',
    href: 'https://example.invalid/project',
    isExternal: true,
  },
  publication: null,
  badge: null,
  actions: null,
};
const meta = {
  component: WorkCard,
  args: { entry: tristanaView, onOpen: () => {} },
  excludeStories: /.*View$/,
  decorators: [withSurface],
  tags: ['autodocs'],
} satisfies Meta<typeof WorkCard>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Hero: StoryObj<typeof meta> = { args: { hero: true } };
