import type { ContentFailure } from './ContentResult';
import type { Page } from './Page';
import type { PageRoute } from './PageRoute';

export interface SiteState {
  readonly pages: readonly Page[];
  readonly path: string;
  readonly authenticated: boolean;
  readonly route: PageRoute;
  readonly status: 'idle' | 'loading' | 'ready' | 'error';
  readonly error: ContentFailure | null;
}
