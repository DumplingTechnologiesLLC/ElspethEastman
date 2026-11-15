import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import {
  useContentPage,
  type ContentPageWiring,
} from '../../hooks/useContentPage';
import {
  copyViews,
  identityViews,
  imageView,
} from '../../application/mappers/pageElements';
export function useHomePageState(props: ContentPageWiring) {
  const { page, editor, state } = useContentPage(props);
  const content = state.content?.kind === PageKind.Home ? state.content : null;
  return {
    ready: content !== null,
    error:
      state.error?.detail ??
      (state.content !== null && content === null
        ? 'This content does not belong to the Home page.'
        : null),
    retry: page.load,
    blocks:
      content === null
        ? []
        : copyViews(content, 'intro', page, editor, props.editor),
    identities:
      content === null
        ? []
        : identityViews(content, page, editor, props.editor),
    image:
      content === null
        ? null
        : imageView(content, 'hero', editor, props.editor, state.mutating),
    controls:
      !props.editor || content === null
        ? null
        : {
            disabled: state.mutating,
            settings: () => editor.open({ type: 'settings' }),
            addText: () =>
              editor.open({
                type: PageCollection.Copy,
                section: 'intro',
                key: null,
              }),
            addIdentity: () =>
              editor.open({ type: PageCollection.Eyebrows, id: null }),
          },
  };
}
