import { useEffect, useSyncExternalStore } from 'react';
import type { ServiceContainer } from '../composition/ServiceContainer';
import type { PageId } from '../domain/models/Page';
import { usePageService } from './usePageService';
import { useSiteService } from './useSiteService';
import { useContentEditorService } from './useContentEditorService';

export interface ContentPageWiring {
  readonly services: ServiceContainer;
  readonly pageId: PageId;
  readonly editor: boolean;
}
export function useContentPage(props: ContentPageWiring) {
  const page = usePageService(props);
  const site = useSiteService(props.services);
  const editor = useContentEditorService(props);
  const state = useSyncExternalStore(
    page.subscribe,
    page.getSnapshot,
    page.getSnapshot,
  );
  const registry = useSyncExternalStore(
    site.subscribe,
    site.getSnapshot,
    site.getSnapshot,
  );
  useEffect(() => page.start(), [page]);
  return { page, site, editor, state, registry };
}
