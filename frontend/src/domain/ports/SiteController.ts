import type { Page } from '../models/Page';
import type { SiteState } from '../models/Site';
import type { Readable } from './Readable';
import type { Unsubscribe } from './Unsubscribe';

export interface SiteController extends Readable<SiteState> {
  readonly year: number;
  start: () => Unsubscribe;
  load: () => Promise<void>;
  navigate: (path: string) => void;
  select: (id: string | null) => void;
  updatePage: (page: Page) => void;
}
