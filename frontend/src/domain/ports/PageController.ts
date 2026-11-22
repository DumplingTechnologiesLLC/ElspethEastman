import type { PageId } from '../models/Page';
import type { PageContentState } from '../models/PageContent';
import type { Readable } from './Readable';
import type { Unsubscribe } from './Unsubscribe';

export interface PageController extends Readable<PageContentState> {
  readonly pageId: PageId;
  start: () => Unsubscribe;
  load: () => Promise<void>;
}
