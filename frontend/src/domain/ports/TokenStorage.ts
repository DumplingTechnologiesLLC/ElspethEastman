import type { Unsubscribe } from './Unsubscribe';

export interface TokenStorage {
  revision: () => number;
  read: () => string | null;
  write: (token: string | null) => void;
  listen: (callback: () => void) => Unsubscribe;
}
