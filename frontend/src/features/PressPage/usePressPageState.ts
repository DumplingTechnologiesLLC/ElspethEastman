import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import { pageIntro } from '../../application/mappers/pageIntro';
import { copyViews } from '../../application/mappers/pageElements';
import { workEntry } from '../../application/mappers/workEntry';
import { collectionActions } from '../../application/mappers/editableActions';
import type { PressEntryView } from '../../application/viewModels/PressEntryView';
export function usePressPageState(props: ContentPageWiring) {
  const { state, registry, page, site, editor } = useContentPage(props);
  const content = state.content?.kind === PageKind.Press ? state.content : null;
  const ids = content?.entries.map((row) => row.id) ?? [],
    appearanceIds = content?.appearances.map((row) => row.id) ?? [];
  const entries =
    content?.entries.map((row, index): PressEntryView => ({
      ...workEntry(row, page, editor, props.editor, ids, index),
      outlet: row.metadata.find((item) => item.key === 'outlet')?.value ?? '',
      category: row.category,
    })) ?? [];
  const route = registry.route;
  const selectedId =
    route.type === 'page' && route.page.id === props.pageId
      ? route.selectedId
      : null;
  const featured =
    entries.find((row) => row.id === content?.feature.itemId) ?? null;
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Press page.'
        : null),
    retry: page.load,
    intro:
      content === null ? null : pageIntro(content, page, editor, props.editor),
    coverageHeading:
      content === null
        ? []
        : copyViews(content, 'coverage', page, editor, props.editor),
    appearanceHeading:
      content === null
        ? []
        : copyViews(content, 'appearances', page, editor, props.editor),
    entries: props.editor
      ? entries
      : entries.filter((row) => row.id !== featured?.id),
    featured,
    selected: entries.find((row) => row.id === selectedId) ?? null,
    open: site.select,
    close: () => site.select(null),
    appearances:
      content?.appearances.map((row, index) => ({
        id: row.id,
        year: row.year,
        title: row.title,
        format: row.format,
        url: row.url,
        actions: props.editor
          ? collectionActions(
              page,
              editor,
              { type: PageCollection.Appearances, id: row.id },
              PageCollection.Appearances,
              null,
              appearanceIds,
              index,
            )
          : null,
      })) ?? [],
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            addCoverage: () =>
              editor.open({ type: PageCollection.ContentEntries, id: null }),
            addAppearance: () =>
              editor.open({ type: PageCollection.Appearances, id: null }),
            addCoverageHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'coverage',
                key: null,
              }),
            addAppearanceHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'appearances',
                key: null,
              }),
          },
  };
}
