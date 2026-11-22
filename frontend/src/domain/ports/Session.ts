import type { Unsubscribe } from './Unsubscribe';

import type { Readable } from './Readable';

import type { SessionState } from '../models/SessionState';

import type { ApplicationPage } from '../models/ApplicationPage';

export interface Session extends Readable<SessionState> {
  getPage: () => ApplicationPage;
  start: () => Unsubscribe;
  change: (key: 'username' | 'password', value: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  navigate: (path: string) => void;
  replace: (path: string) => void;
  revision: () => number;
  expire: (returnTo: string, revision?: number) => void;
}
