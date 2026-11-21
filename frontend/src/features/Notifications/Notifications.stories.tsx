import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notifications } from './Notifications.presentational';
import type { useNotificationsState } from './useNotificationsState';
export const notificationsView: ReturnType<typeof useNotificationsState> = {
  toasts: [
    {
      id: 1,
      title: 'Success',
      content: 'Action submitted successfully.',
      flavor: 'success',
    },
  ],
};

const meta = {
  component: Notifications,
  excludeStories: /.*View$/,
  args: notificationsView,
  tags: ['autodocs'],
} satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
