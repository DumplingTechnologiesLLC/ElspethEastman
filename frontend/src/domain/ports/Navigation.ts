import type { Unsubscribe } from './Unsubscribe';

export interface Navigation {
  location: () => string;
  go: (path: string) => void;
  replace: (path: string) => void;
  listen: (callback: () => void) => Unsubscribe;
}
