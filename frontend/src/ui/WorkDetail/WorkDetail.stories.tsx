import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkDetail } from './WorkDetail.presentational';
import { tristanaView } from '../WorkCard/WorkCard.stories';
import { withSurface } from '../../stories/withSurface';
const meta = {
  component: WorkDetail,
  args: { entry: tristanaView, onClose: () => {} },
  decorators: [withSurface],
  tags: ['autodocs'],
} satisfies Meta<typeof WorkDetail>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
