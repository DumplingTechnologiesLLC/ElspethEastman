import { CopyKind } from '../../domain/models/PageCopy';
import { PageKind } from '../../domain/models/Page';
import { PageCollection } from '../../domain/models/PageCollection';
import type { PageContent } from '../../domain/models/PageContent';
import type { PageController } from '../../domain/ports/PageController';
import type { ContentEditorController } from '../../domain/ports/ContentEditorController';
import type { PageIntroView } from '../viewModels/PageIntroView';
import { copyViews, identityViews } from './pageElements';
import { collectionActions } from './editableActions';

function introAction(content: PageContent): PageIntroView['action'] {
  if (content.kind === PageKind.Music)
    return {
      label: 'Explore the music',
      href: '#releases',
      isExternal: false,
      icon: 'jump',
    };
  if (
    content.kind === PageKind.Bio ||
    content.kind === PageKind.Home ||
    content.page.primaryAction === null
  )
    return null;
  return {
    ...content.page.primaryAction,
    icon:
      content.kind === PageKind.Voiceover
        ? 'play'
        : content.kind === PageKind.Streaming
          ? 'stream'
          : 'external',
  };
}
export function pageIntro(
  content: PageContent,
  page: PageController,
  editor: ContentEditorController,
  editing: boolean,
): PageIntroView {
  const blocks = copyViews(content, 'intro', page, editor, editing);
  const ids = content.trivia.map((item) => item.id);
  return {
    fallbackHeading: blocks.some((block) => block.kind === CopyKind.Headline)
      ? null
      : content.page.title,
    blocks,
    identities: identityViews(content, page, editor, editing),
    trivia: content.trivia.map((item, index) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      actions: editing
        ? collectionActions(
            page,
            editor,
            { type: PageCollection.Trivia, id: item.id },
            PageCollection.Trivia,
            null,
            ids,
            index,
          )
        : null,
    })),
    action: introAction(content),
    controls: editing
      ? {
          disabled: page.getSnapshot().mutating,
          settings: () => editor.open({ type: 'settings' }),
          addText: () =>
            editor.open({
              type: PageCollection.Copy,
              section: 'intro',
              key: null,
            }),
          addIdentity: () =>
            editor.open({ type: PageCollection.Eyebrows, id: null }),
          addFact:
            content.trivia.length >= 3
              ? null
              : () => editor.open({ type: PageCollection.Trivia, id: null }),
        }
      : null,
  };
}
