import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import { pageIntro } from '../../application/mappers/pageIntro';
import { workEntry } from '../../application/mappers/workEntry';
import { copyViews } from '../../application/mappers/pageElements';
import { collectionActions } from '../../application/mappers/editableActions';
import type { TextCardView } from '../../application/viewModels/TextCardView';
export function useStreamingPageState(props: ContentPageWiring) {
  const { state, page, editor } = useContentPage(props);
  const content =
    state.content?.kind === PageKind.Streaming ? state.content : null;
  const ids = content?.entries.map((row) => row.id) ?? [],
    clipIds = content?.clips.map((row) => row.id) ?? [];
  const entries =
    content?.entries.map((row, index) =>
      workEntry(row, page, editor, props.editor, ids, index),
    ) ?? [];
  const featured =
    entries.find((row) => row.id === content?.feature.itemId) ?? null;
  const rows: readonly TextCardView[] =
    content?.entries
      .filter((row) => props.editor || row.id !== featured?.id)
      .map((row) => {
        const view = entries.find((entry) => entry.id === row.id)!;
        return {
          id: row.id,
          title: row.title,
          eyebrow: row.eyebrow,
          description: null,
          category: row.category,
          action: view.action,
          badge: view.badge,
          actions: view.actions,
        };
      }) ?? [];
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Streaming page.'
        : null),
    retry: page.load,
    intro:
      content === null ? null : pageIntro(content, page, editor, props.editor),
    streamHeading:
      content === null
        ? []
        : copyViews(content, 'streams', page, editor, props.editor),
    clipHeading:
      content === null
        ? []
        : copyViews(content, 'clips', page, editor, props.editor),
    featured,
    rows,
    clips:
      content?.clips.map((row, index): TextCardView => ({
        id: row.id,
        title: row.title,
        eyebrow: row.eyebrow,
        description: null,
        category: row.category,
        action: { ...row.action },
        badge: null,
        actions: props.editor
          ? collectionActions(
              page,
              editor,
              { type: PageCollection.StreamClips, id: row.id },
              PageCollection.StreamClips,
              null,
              clipIds,
              index,
            )
          : null,
      })) ?? [],
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            addStream: () =>
              editor.open({ type: PageCollection.ContentEntries, id: null }),
            addClip: () =>
              editor.open({ type: PageCollection.StreamClips, id: null }),
            addStreamHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'streams',
                key: null,
              }),
            addClipHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'clips',
                key: null,
              }),
          },
  };
}
