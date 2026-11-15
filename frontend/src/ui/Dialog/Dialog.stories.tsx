import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog.presentational';
const meta = {
  component: Dialog,
  args: {
    title: 'Edit entry',
    context: 'Portfolio',
    children: 'Form content',
    onClose: () => {},
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
