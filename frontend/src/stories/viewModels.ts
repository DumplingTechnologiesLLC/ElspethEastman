import { fn } from 'storybook/test';
import type { useContactState } from '../features/Contact/useContactState';
import type { useSkillsState } from '../features/Skills/useSkillsState';
import type { useProjectsState } from '../features/Projects/useProjectsState';
import type { useExperienceState } from '../features/Experience/useExperienceState';
import type { useFooterState } from '../features/Footer/useFooterState';
import type { useLoginState } from '../features/Login/useLoginState';
import type { useNavbarState } from '../features/Navbar/useNavbarState';
import type { useNotificationsState } from '../features/Notifications/useNotificationsState';
export const contactView: ReturnType<typeof useContactState> = {
  draft: { name: '', email: '', message: '' },
  errors: {},
  open: true,
  submitting: false,
  change: fn(),
  show: fn(),
  submit: fn().mockResolvedValue(undefined),
};
export const skillsView: ReturnType<typeof useSkillsState> = {
  editor: false,
  loaded: true,
  skills: {
    voice_acting: 'Characters, narration, and animation.',
    game_development: 'Composition and sound design.',
    streaming: 'Live streams and broadcasts.',
  },
  draft: {
    voice_acting: 'Characters, narration, and animation.',
    game_development: 'Composition and sound design.',
    streaming: 'Live streams and broadcasts.',
  },
  lookup: {
    voice_acting: 'Voice Acting',
    game_development: 'Game Development',
    streaming: 'Streaming',
  },
  selected: 'voice_acting',
  errors: {},
  submitting: false,
  select: fn(),
  change: fn(),
  reset: fn(),
  save: fn().mockResolvedValue(undefined),
};
export const sampleProject = {
  id: 1,
  title: 'Project preview',
  src: 'example',
  uuid: 1,
  thumbnail: 'https://img.youtube.com/vi/example/hqdefault.jpg',
  embed: 'https://www.youtube.com/embed/example?rel=0&showinfo=0&autoplay=1',
};
export const projectsView: ReturnType<typeof useProjectsState> = {
  mode: 'latest',
  loaded: true,
  projects: [sampleProject],
  cached: [sampleProject],
  page: 1,
  pages: 2,
  errors: {},
  draft: { ...sampleProject, id: -1, title: '', src: '' },
  open: false,
  busy: [],
  change: fn(),
  reset: fn(),
  show: fn(),
  save: fn().mockResolvedValue(undefined),
  saveAll: fn().mockResolvedValue(undefined),
  remove: fn().mockResolvedValue(undefined),
  nextPage: fn().mockResolvedValue(undefined),
  navigate: fn(),
};
export const experienceView: ReturnType<typeof useExperienceState> = {
  editor: false,
  loaded: true,
  groups: {
    'Voice Credits': [
      {
        id: 1,
        year: '(2026)',
        credit: 'Character voice',
        link: 'https://example.invalid',
        tba: false,
      },
    ],
    'Music - Games': [],
    'Music - Miscellaneous': [],
    'Streaming - Credits': [],
  },
  draft: {
    year: '2026',
    credit: '',
    link: '',
    tba: false,
    category: 'Voice Credits',
  },
  cached: {
    year: '2026',
    credit: '',
    link: '',
    tba: false,
    category: 'Voice Credits',
  },
  id: null,
  open: false,
  errors: {},
  year: 2026,
  edit: fn(),
  close: fn(),
  change: fn(),
  reset: fn(),
  save: fn().mockResolvedValue(undefined),
  remove: fn().mockResolvedValue(undefined),
};
export const footerView: ReturnType<typeof useFooterState> = {
  editor: false,
  loaded: true,
  data: {
    stats: [{ id: 1, value: '10+', label: 'Projects', percent: 70 }],
    affiliations: [
      { id: 1, affiliation: 'Studio', link: 'https://example.invalid' },
    ],
  },
  cached: [{ id: 1, affiliation: 'Studio', link: 'https://example.invalid' }],
  draft: { id: -1, affiliation: '', link: '' },
  errors: {},
  busy: [],
  open: false,
  change: fn(),
  reset: fn(),
  show: fn(),
  save: fn().mockResolvedValue(undefined),
  remove: fn().mockResolvedValue(undefined),
};
export const loginView: ReturnType<typeof useLoginState> = {
  path: '/login',
  authenticated: false,
  username: '',
  password: '',
  submitting: false,
  errors: {},
  change: fn(),
  login: fn().mockResolvedValue(undefined),
};
export const navbarView: ReturnType<typeof useNavbarState> = {
  cms: false,
  authenticated: false,
  navigate: fn(),
  logout: fn().mockResolvedValue(undefined),
  onContact: fn(),
};
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
