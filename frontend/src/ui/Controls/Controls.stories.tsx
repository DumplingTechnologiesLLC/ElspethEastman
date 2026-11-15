import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Controls.presentational';
const meta = {
  component: Button,
  args: { children: 'Publish changes' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
export default meta;
export const Primary: StoryObj<typeof meta> = {};
export const Secondary: StoryObj<typeof meta> = {
  args: { variant: 'secondary' },
};
export const Danger: StoryObj<typeof meta> = {
  args: { variant: 'danger', children: 'Delete entry' },
};
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } };
