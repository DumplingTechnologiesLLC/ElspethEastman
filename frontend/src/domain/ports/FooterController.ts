import type { Readable } from './Readable';

import type { FooterState } from '../models/FooterState';

export interface FooterController extends Readable<FooterState> {
  load: () => Promise<void>;
  change: (id: number, key: 'affiliation' | 'link', value: string) => void;
  reset: (id: number) => void;
  show: (open: boolean) => void;
  save: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}
