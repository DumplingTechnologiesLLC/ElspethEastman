import type { Readable } from './Readable';

import type { FooterState } from '../models/FooterState';

export interface FooterController extends Readable<FooterState> {
  load: () => Promise<void>;
  change: (id: string, key: 'affiliation' | 'link', value: string) => void;
  reset: (id: string) => void;
  show: (open: boolean) => void;
  save: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}
