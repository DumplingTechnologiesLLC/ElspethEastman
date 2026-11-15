import { EXPLORE_KINDS, PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import { pageIntro } from '../../application/mappers/pageIntro';
import { copyViews, imageView } from '../../application/mappers/pageElements';
import { collectionActions } from '../../application/mappers/editableActions';
import { pageHref } from '../../application/routing/pageRoutes';
export function useBioPageState(props: ContentPageWiring) {
  const { state, registry, page, site, editor } = useContentPage(props);
  const content = state.content?.kind === PageKind.Bio ? state.content : null;
  const chapterIds = content?.chapters.map((row) => row.id) ?? [],
    currentIds = content?.currentItems.map((row) => row.id) ?? [];
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Bio page.'
        : null),
    retry: page.load,
    intro:
      content === null ? null : pageIntro(content, page, editor, props.editor),
    portrait:
      content === null
        ? null
        : imageView(content, 'portrait', editor, props.editor, state.mutating),
    biography:
      content === null
        ? []
        : copyViews(content, 'short_bio', page, editor, props.editor),
    storyHeading:
      content === null
        ? []
        : copyViews(content, 'story', page, editor, props.editor),
    currentHeading:
      content === null
        ? []
        : copyViews(content, 'current', page, editor, props.editor),
    exploreHeading:
      content === null
        ? []
        : copyViews(content, 'explore', page, editor, props.editor),
    chapters:
      content?.chapters.map((row, index) => ({
        id: row.id,
        eyebrow: row.eyebrow,
        heading: row.heading,
        body: row.body,
        actions: props.editor
          ? collectionActions(
              page,
              editor,
              { type: PageCollection.BioChapters, id: row.id },
              PageCollection.BioChapters,
              null,
              chapterIds,
              index,
            )
          : null,
      })) ?? [],
    current:
      content?.currentItems.map((row, index) => ({
        id: row.id,
        eyebrow: row.eyebrow,
        title: row.title,
        description: row.description,
        link: row.link === null ? null : { ...row.link },
        actions: props.editor
          ? collectionActions(
              page,
              editor,
              { type: PageCollection.CurrentItems, id: row.id },
              PageCollection.CurrentItems,
              null,
              currentIds,
              index,
            )
          : null,
      })) ?? [],
    explore: EXPLORE_KINDS.flatMap((kind) => {
      const item = registry.pages.find((row) => row.kind === kind);
      return item === undefined
        ? []
        : [
            {
              id: item.id,
              label: item.title,
              href: pageHref(item, props.editor),
            },
          ];
    }),
    navigate: site.navigate,
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            addBiography: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'short_bio',
                key: null,
              }),
            addChapter: () =>
              editor.open({ type: PageCollection.BioChapters, id: null }),
            addCurrent: () =>
              editor.open({ type: PageCollection.CurrentItems, id: null }),
            addStoryHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'story',
                key: null,
              }),
            addCurrentHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'current',
                key: null,
              }),
            addExploreHeading: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'explore',
                key: null,
              }),
          },
  };
}
