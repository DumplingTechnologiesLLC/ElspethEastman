import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notifications } from './Notifications.presentational';
import { notificationsView } from '../../stories/viewModels';
const meta = {
  component: Notifications,
  args: notificationsView,
  tags: ['autodocs'],
} satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
