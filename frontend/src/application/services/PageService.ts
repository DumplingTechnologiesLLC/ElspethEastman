import type { ContentRepository } from '../../domain/ports/ContentRepository';
import type { PageController } from '../../domain/ports/PageController';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { ContentResult } from '../../domain/models/ContentResult';
import type { PageId } from '../../domain/models/Page';
import type {
  PageContent,
  PageContentState,
} from '../../domain/models/PageContent';
import { Store } from './Store';

export class PageService
  extends Store<PageContentState>
  implements PageController
{
  private content: PageContent | null = null;
  private pending: Promise<ContentResult<PageContent>> | undefined;
  private version = 0;
  private consumers = 0;

  constructor(
    readonly pageId: PageId,
    private repository: Pick<ContentRepository, 'page'>,
    private alerts: UIAlerts,
  ) {
    super({
      pageId,
      content: null,
      status: 'idle',
      error: null,
      mutating: false,
    });
  }
  start = () => {
    this.consumers++;
    if (this.consumers === 1) void this.load();
    return () => {
      this.consumers--;
      if (this.consumers === 0) this.version++;
    };
  };
  load = async () => {
    const version = ++this.version;
    if (this.content !== null) {
      this.patch({ content: this.content, status: 'ready', error: null });
      return;
    }
    this.patch({ status: 'loading', error: null });
    this.pending ??= this.repository
      .page(this.pageId)
      .catch((): ContentResult<PageContent> => ({
        ok: false,
        error: {
          status: null,
          detail: 'Could not load this page. Please try again.',
          fields: {},
        },
      }));
    let result = await this.pending;
    this.pending = undefined;
    if (result.ok && result.value.page.id !== this.pageId)
      result = {
        ok: false,
        error: {
          status: null,
          detail: 'Could not load this page. Please try again.',
          fields: {},
        },
      };
    if (result.ok) this.content = result.value;
    if (version !== this.version) return;
    if (!result.ok) {
      this.patch({ status: 'error', error: result.error });
      this.alerts.show({
        title: 'Could not load the page',
        content: result.error.detail,
        flavor: 'error',
      });
      return;
    }
    this.patch({ content: result.value, status: 'ready' });
  };
}
