import type { Unsubscribe } from './Unsubscribe';

export interface TokenStorage {
  read: () => string | null;
  write: (token: string | null) => void;
  listen: (callback: () => void) => Unsubscribe;
}
