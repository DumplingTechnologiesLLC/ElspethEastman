import type { Meta, StoryObj } from '@storybook/react-vite';
import { Portfolio } from './Portfolio.presentational';
import { PageKind } from '../../domain/models/Page';
const noop = () => {};
export const portfolioView = {
  screen: 'page',
  editor: false,
  authenticated: false,
  pageId: '00000000-0000-4000-8000-000000000001',
  pageKind: PageKind.Home,
  title: 'Elspeth Eastman',
  homeHref: '/',
  links: [
    {
      id: '00000000-0000-4000-8000-000000000002',
      label: 'Voiceover',
      href: '/voiceover',
      active: true,
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      label: 'Music',
      href: '/music',
      active: false,
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      label: 'Streaming',
      href: '/streaming',
      active: false,
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      label: 'Press',
      href: '/press',
      active: false,
    },
    {
      id: '00000000-0000-4000-8000-000000000006',
      label: 'Bio',
      href: '/bio',
      active: false,
    },
  ],
  year: 2026,
  toggleHref: '/cms',
  error: '',
  navigate: noop,
  retry: async () => {},
  logout: async () => {},
  pages: {
    [PageKind.Home]: 'Home content',
    [PageKind.Voiceover]: 'Voiceover content',
    [PageKind.Music]: 'Music content',
    [PageKind.Streaming]: 'Streaming content',
    [PageKind.Press]: 'Press content',
    [PageKind.Bio]: 'Bio content',
  },
  login: 'Login form',
  editorDialog: 'Editor dialog',
  notifications: null,
} satisfies Parameters<typeof Portfolio>[0];
const meta = {
  component: Portfolio,
  args: portfolioView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Portfolio>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: { editor: true, authenticated: true, toggleHref: '/' },
};
export const Missing: StoryObj<typeof meta> = { args: { screen: 'missing' } };
export const Loading: StoryObj<typeof meta> = { args: { screen: 'loading' } };
export const Failure: StoryObj<typeof meta> = {
  args: { screen: 'error', error: 'Unable to reach the server.' },
};
