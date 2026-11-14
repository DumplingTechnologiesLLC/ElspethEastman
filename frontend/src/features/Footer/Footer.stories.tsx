import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer.presentational';
import { footerView } from '../../stories/viewModels';
const meta = {
  component: Footer,
  args: footerView,
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Editor: Story = { args: { editor: true } };
export const Loading: Story = { args: { loaded: false } };
