import type { ContentRepository } from '../../domain/ports/ContentRepository';
import type { Session } from '../../domain/ports/Session';
import type { SiteController } from '../../domain/ports/SiteController';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { ContentResult } from '../../domain/models/ContentResult';
import type { Page } from '../../domain/models/Page';
import type { SiteState } from '../../domain/models/Site';
import {
  renamedPagePath,
  resolvePageRoute,
  withSelection,
} from '../routing/pageRoutes';
import { Store } from './Store';

export class SiteService extends Store<SiteState> implements SiteController {
  private pages: readonly Page[] | undefined;
  private pending: Promise<ContentResult<readonly Page[]>> | undefined;
  private version = 0;

  constructor(
    private repository: Pick<ContentRepository, 'site'>,
    private session: Pick<
      Session,
      'getSnapshot' | 'subscribe' | 'navigate' | 'replace' | 'expire'
    >,
    private alerts: UIAlerts,
    readonly year: number,
  ) {
    const { path, authenticated } = session.getSnapshot();
    super({
      pages: [],
      path,
      authenticated,
      route: resolvePageRoute(path, []),
      status: 'idle',
      error: null,
    });
  }

  start = () => {
    const stop = this.session.subscribe(() => {
      const { path, authenticated } = this.session.getSnapshot();
      const state = this.getSnapshot();
      if (path !== state.path || authenticated !== state.authenticated)
        void this.load();
    });
    void this.load();
    return () => {
      this.version++;
      stop();
    };
  };

  load = async () => {
    const version = ++this.version;
    const { path, authenticated } = this.session.getSnapshot();
    if (this.pages !== undefined) {
      this.patch({
        pages: this.pages,
        path,
        authenticated,
        route: resolvePageRoute(path, this.pages),
        status: 'ready',
        error: null,
      });
      return;
    }
    this.patch({ path, authenticated, status: 'loading', error: null });
    this.pending ??= this.repository
      .site()
      .catch((): ContentResult<readonly Page[]> => ({
        ok: false,
        error: {
          status: null,
          detail: 'Could not load the site. Please try again.',
          fields: {},
        },
      }));
    const result = await this.pending;
    this.pending = undefined;
    if (result.ok) this.pages = result.value;
    if (version !== this.version) return;
    if (!result.ok) {
      this.patch({ status: 'error', error: result.error });
      if (result.error.status === 403) {
        this.session.expire(this.session.getSnapshot().path);
        return;
      }
      this.alerts.show({
        title: 'Could not load the site',
        content: result.error.detail,
        flavor: 'error',
      });
      return;
    }
    this.patch({
      pages: result.value,
      route: resolvePageRoute(path, result.value),
      status: 'ready',
    });
  };

  navigate = (path: string) => this.session.navigate(path);

  select = (id: number | null) => {
    const { route, path } = this.getSnapshot();
    if (route.type !== 'page') return;
    const next = withSelection(path, route.page.kind, id);
    if (next !== path) this.session.navigate(next);
  };

  updatePage = (page: Page) => {
    const state = this.getSnapshot();
    const existing = state.pages.find((candidate) => candidate.id === page.id);
    if (existing === undefined || existing.kind !== page.kind) return;
    const pages = state.pages.map((candidate) =>
      candidate.id === page.id ? page : candidate,
    );
    const path =
      state.route.type === 'page' && state.route.page.id === page.id
        ? renamedPagePath(state.path, page, state.route.editor)
        : state.path;
    this.pages = pages;
    this.patch({ pages, path, route: resolvePageRoute(path, pages) });
    if (path !== state.path) this.session.replace(path);
  };
}
