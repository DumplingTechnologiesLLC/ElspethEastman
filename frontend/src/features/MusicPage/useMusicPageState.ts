import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import { pageIntro } from '../../application/mappers/pageIntro';
import { copyViews } from '../../application/mappers/pageElements';
import {
  collectionActions,
  editActions,
} from '../../application/mappers/editableActions';
export function useMusicPageState(props: ContentPageWiring) {
  const { state, page, editor } = useContentPage(props);
  const content = state.content?.kind === PageKind.Music ? state.content : null;
  const ids = content?.releases.map((row) => row.id) ?? [];
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Music page.'
        : null),
    retry: page.load,
    intro:
      content === null ? null : pageIntro(content, page, editor, props.editor),
    releaseHeading:
      content === null
        ? []
        : copyViews(content, 'releases', page, editor, props.editor),
    practice:
      content === null
        ? null
        : {
            eyebrow: content.feature.eyebrow,
            title: content.feature.title,
            description: content.feature.description,
            image: {
              url: content.feature.image.asset.url,
              altText: content.feature.image.altText,
            },
            facts: content.feature.facts.map((fact) => ({
              label: fact.label,
              value: fact.value,
            })),
            action: { ...content.feature.action },
            actions: props.editor
              ? editActions(editor, { type: 'practice' }, state.mutating, false)
              : null,
          },
    releases:
      content?.releases.map((row, index) => ({
        id: row.id,
        title: row.title,
        eyebrow: `${row.year} · ${row.format}`,
        description: row.description,
        artworkTitle: row.artworkTitle,
        image: { url: row.artwork.asset.url, altText: row.artwork.altText },
        action: { ...row.action },
        actions: props.editor
          ? collectionActions(
              page,
              editor,
              { type: PageCollection.Releases, id: row.id },
              PageCollection.Releases,
              null,
              ids,
              index,
            )
          : null,
      })) ?? [],
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            add: () => editor.open({ type: PageCollection.Releases, id: null }),
            addReleaseHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'releases',
                key: null,
              }),
          },
  };
}
