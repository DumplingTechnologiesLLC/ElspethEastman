import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Primitives.presentational';
const meta = {
  component: Button,
  args: { children: 'Button' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
export default meta;
export const Primary: StoryObj<typeof meta> = {};
export const Secondary: StoryObj<typeof meta> = {
  args: { variant: 'secondary' },
};
export const Warning: StoryObj<typeof meta> = { args: { variant: 'warning' } };
export const Danger: StoryObj<typeof meta> = { args: { variant: 'danger' } };
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } };
