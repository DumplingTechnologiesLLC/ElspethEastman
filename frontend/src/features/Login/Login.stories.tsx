import type { Meta, StoryObj } from '@storybook/react-vite';
import { Login } from './Login.presentational';
import { fn } from 'storybook/test';
import type { useLoginState } from './useLoginState';
export const loginView: ReturnType<typeof useLoginState> = {
  path: '/login',
  authenticated: false,
  username: '',
  password: '',
  submitting: false,
  errors: {},
  change: fn(),
  login: fn().mockResolvedValue(undefined),
};

const meta = {
  component: Login,
  excludeStories: /.*View$/,
  args: loginView,
  tags: ['autodocs'],
} satisfies Meta<typeof Login>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Submitting: Story = { args: { submitting: true } };
