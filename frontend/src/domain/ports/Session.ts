import type { Unsubscribe } from './Unsubscribe';

import type { Readable } from './Readable';

import type { SessionState } from '../models/SessionState';

export interface Session extends Readable<SessionState> {
  start: () => Unsubscribe;
  change: (key: 'username' | 'password', value: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  navigate: (path: string) => void;
  replace: (path: string) => void;
  revision: () => number;
  expire: (returnTo: string, revision?: number) => void;
}
