import type { Unsubscribe } from './Unsubscribe';

export interface Readable<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => Unsubscribe;
}
