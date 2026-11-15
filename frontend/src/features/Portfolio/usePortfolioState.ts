import { useEffect, useSyncExternalStore } from 'react';
import type { ServiceContainer } from '../../composition/ServiceContainer';
import { NAVIGATION_KINDS, PageKind } from '../../domain/models/Page';
import { pageHref } from '../../application/routing/pageRoutes';
import { useSiteService } from '../../hooks/useSiteService';
import { useSessionService } from '../../hooks/useSessionService';

export interface PortfolioWiring {
  readonly services: ServiceContainer;
}
export function usePortfolioState({ services }: PortfolioWiring) {
  const site = useSiteService(services);
  const session = useSessionService(services);
  const state = useSyncExternalStore(
    site.subscribe,
    site.getSnapshot,
    site.getSnapshot,
  );
  useEffect(() => session.start(), [session]);
  useEffect(() => site.start(), [site]);
  const route = state.route;
  const editor = route.type !== 'login' && route.editor && state.authenticated;
  const home = state.pages.find((page) => page.kind === PageKind.Home);
  const selected = route.type === 'page' ? route.page : null;
  const screen =
    state.status === 'idle' || state.status === 'loading'
      ? 'loading'
      : state.status === 'error'
        ? 'error'
        : route.type === 'page' && route.editor && !state.authenticated
          ? 'authenticating'
          : route.type;
  return {
    screen,
    editor,
    authenticated: state.authenticated,
    pageId: selected?.id ?? 0,
    pageKind: selected?.kind ?? null,
    title:
      selected === null
        ? 'Elspeth Eastman'
        : selected.kind === PageKind.Home
          ? 'Elspeth Eastman'
          : `${selected.title} · Elspeth Eastman`,
    homeHref: home === undefined ? '/' : pageHref(home, editor),
    links: NAVIGATION_KINDS.flatMap((kind) => {
      const page = state.pages.find((candidate) => candidate.kind === kind);
      return page === undefined
        ? []
        : [
            {
              id: page.id,
              label: page.title,
              href: pageHref(page, editor),
              active: page.id === selected?.id,
            },
          ];
    }),
    year: site.year,
    toggleHref: selected === null ? '/cms' : pageHref(selected, !editor),
    error: state.error?.detail ?? 'Please try again.',
    navigate: site.navigate,
    retry: site.load,
    logout: session.logout,
  };
}
