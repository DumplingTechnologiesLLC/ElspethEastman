import type { Meta, StoryObj } from '@storybook/react-vite';
import { Experience } from './Experience.presentational';
import { experienceView } from '../../stories/viewModels';
const meta = {
  component: Experience,
  args: experienceView,
  tags: ['autodocs'],
} satisfies Meta<typeof Experience>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Editor: Story = { args: { editor: true } };
export const Loading: Story = { args: { loaded: false } };
