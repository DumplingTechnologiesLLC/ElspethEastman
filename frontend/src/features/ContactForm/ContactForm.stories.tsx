import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactForm } from './ContactForm.presentational';
import { withSurface } from '../../stories/withSurface';
const noop = () => {};
export const contactFormView = {
  draft: { name: '', email: '', message: '' },
  errors: {},
  submitting: false,
  change: noop,
  submit: async () => {},
} satisfies Parameters<typeof ContactForm>[0];
const meta = {
  component: ContactForm,
  decorators: [withSurface],
  excludeStories: /.*View$/,
  args: contactFormView,
  tags: ['autodocs'],
} satisfies Meta<typeof ContactForm>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Submitting: StoryObj<typeof meta> = { args: { submitting: true } };
export const Validation: StoryObj<typeof meta> = {
  args: {
    errors: {
      name: 'Name is required',
      email: 'Email is required',
      message: 'Message is required',
    },
  },
};
