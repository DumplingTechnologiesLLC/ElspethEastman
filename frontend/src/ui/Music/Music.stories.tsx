import type { Meta, StoryObj } from '@storybook/react-vite';
import { Music } from './Music.presentational';
const meta = { component: Music, args: {}, tags: ['autodocs'] } satisfies Meta<
  typeof Music
>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
