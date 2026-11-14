import type { Meta, StoryObj } from '@storybook/react-vite';
import { Video } from './Video.presentational';
const meta = {
  component: Video,
  args: {
    title: 'Video preview',
    thumbnail: '/static/media/logo192.png',
    embed: 'about:blank',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Video>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
