import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skills } from './Skills.presentational';
import { skillsView } from '../../stories/viewModels';
const meta = {
  component: Skills,
  args: skillsView,
  tags: ['autodocs'],
} satisfies Meta<typeof Skills>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Editor: Story = { args: { editor: true } };
export const Loading: Story = { args: { loaded: false } };
