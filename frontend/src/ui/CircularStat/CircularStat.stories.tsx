import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircularStat } from './CircularStat.presentational';
const meta = {
  component: CircularStat,
  args: { label: 'Projects', value: '10+', percent: 70 },
  tags: ['autodocs'],
} satisfies Meta<typeof CircularStat>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
