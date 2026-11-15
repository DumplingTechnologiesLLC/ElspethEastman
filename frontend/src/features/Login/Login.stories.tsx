import type { Meta, StoryObj } from '@storybook/react-vite';
import { Login } from './Login.presentational';
import { loginView } from '../../stories/viewModels';
const meta = {
  component: Login,
  args: loginView,
  tags: ['autodocs'],
} satisfies Meta<typeof Login>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Submitting: Story = { args: { submitting: true } };
