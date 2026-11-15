import type { Page } from '../models/Page';
import type { SiteState } from '../models/Site';
import type { Readable } from './Readable';
import type { Unsubscribe } from './Unsubscribe';

export interface SiteController extends Readable<SiteState> {
  start: () => Unsubscribe;
  load: () => Promise<void>;
  navigate: (path: string) => void;
  select: (id: number | null) => void;
  updatePage: (page: Page) => void;
}
