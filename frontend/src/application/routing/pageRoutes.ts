import { PageKind } from '../../domain/models/Page';
import type { Page } from '../../domain/models/Page';
import type { PageRoute } from '../../domain/models/PageRoute';

const origin = 'https://portfolio.invalid';

export function pageHref(page: Page, editor: boolean): string {
  const suffix = page.slug === '' ? '' : `/${page.slug}`;
  return editor ? `/cms${suffix}` : suffix || '/';
}

function selectionParameter(kind: PageKind): 'role' | 'entry' | null {
  return kind === PageKind.Voiceover
    ? 'role'
    : kind === PageKind.Press
      ? 'entry'
      : null;
}

function selectedId(value: string | null): string | null {
  return value !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value.toLowerCase()
    : null;
}

export function resolvePageRoute(
  path: string,
  pages: readonly Page[],
): PageRoute {
  const url = new URL(path, origin);
  const pathname = url.pathname.replace(/\/$/, '');
  if (pathname === '/login') return { type: 'login' };
  const editor = pathname === '/cms' || pathname.startsWith('/cms/');
  const slug = (editor ? pathname.slice(4) : pathname).replace(/^\//, '');
  const page = pages.find((candidate) => candidate.slug === slug);
  if (!page) return { type: 'missing', editor };
  const parameter = selectionParameter(page.kind);
  return {
    type: 'page',
    page,
    editor,
    selectedId: selectedId(
      parameter === null ? null : url.searchParams.get(parameter),
    ),
    anchor: url.hash,
  };
}

export function withSelection(
  path: string,
  kind: PageKind,
  id: string | null,
): string {
  const parameter = selectionParameter(kind);
  if (parameter === null) return path;
  const url = new URL(path, origin);
  if (id === null) url.searchParams.delete(parameter);
  else url.searchParams.set(parameter, String(id));
  return url.pathname + url.search + url.hash;
}

export function renamedPagePath(
  path: string,
  page: Page,
  editor: boolean,
): string {
  const url = new URL(path, origin);
  return pageHref(page, editor) + url.search + url.hash;
}
