import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Modal } from './Modal.presentational';
const meta = {
  component: Modal,
  args: {
    open: true,
    onClose: fn(),
    title: 'Modal title',
    children: 'Modal content',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
