import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import { pageIntro } from '../../application/mappers/pageIntro';
import { workEntry } from '../../application/mappers/workEntry';
import { copyViews } from '../../application/mappers/pageElements';
export function useVoiceoverPageState(props: ContentPageWiring) {
  const { state, registry, page, site, editor } = useContentPage(props);
  const content =
    state.content?.kind === PageKind.Voiceover ? state.content : null;
  const ids = content?.roles.map((row) => row.id) ?? [];
  const rows =
    content?.roles.map((entry, index) =>
      workEntry(entry, page, editor, props.editor, ids, index),
    ) ?? [];
  const route = registry.route;
  const selectedId =
    route.type === 'page' && route.page.id === props.pageId
      ? route.selectedId
      : null;
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const featured =
    rows.find((row) => row.id === content?.feature.itemId) ?? null;
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Voiceover page.'
        : null),
    retry: page.load,
    intro:
      content === null ? null : pageIntro(content, page, editor, props.editor),
    section:
      content === null
        ? []
        : copyViews(content, 'roles', page, editor, props.editor),
    rows: props.editor ? rows : rows.filter((row) => row.id !== featured?.id),
    featured,
    selected,
    open: site.select,
    close: () => site.select(null),
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            add: () =>
              editor.open({ type: PageCollection.ContentEntries, id: null }),
            addHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'roles',
                key: null,
              }),
          },
  };
}
