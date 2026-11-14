import type { Meta, StoryObj } from '@storybook/react-vite';
import { Contact } from './Contact.presentational';
import { contactView } from '../../stories/viewModels';
const meta = {
  component: Contact,
  args: contactView,
  tags: ['autodocs'],
} satisfies Meta<typeof Contact>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Submitting: Story = { args: { submitting: true } };
