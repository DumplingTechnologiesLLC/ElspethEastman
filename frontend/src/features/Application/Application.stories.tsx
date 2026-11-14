import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Application } from './Application.presentational';
const meta = {
  component: Application,
  args: {
    page: 'projects',
    onContact: fn(),
    navbar: <span>Navigation slot</span>,
    skills: <span>Skills slot</span>,
    projects: <span>Projects slot</span>,
    experience: <span>Experience slot</span>,
    footer: <span>Footer slot</span>,
    contact: null,
    login: <span>Login slot</span>,
    notifications: null,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Application>;
export default meta;
export const Projects: StoryObj<typeof meta> = {};
export const Home: StoryObj<typeof meta> = { args: { page: 'home' } };
export const CMS: StoryObj<typeof meta> = { args: { page: 'cms' } };
export const Login: StoryObj<typeof meta> = { args: { page: 'login' } };
