import type { Unsubscribe } from './Unsubscribe';

export interface Clock {
  now: () => number;
  later: (callback: () => void, milliseconds: number) => Unsubscribe;
}
