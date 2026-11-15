import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Hero } from './Hero.presentational';
const meta = {
  component: Hero,
  args: { onContact: fn() },
  tags: ['autodocs'],
} satisfies Meta<typeof Hero>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
