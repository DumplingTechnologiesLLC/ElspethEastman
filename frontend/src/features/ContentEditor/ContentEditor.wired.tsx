import { ContentEditor } from './ContentEditor.presentational';
import {
  useContentEditorState,
  type ContentEditorWiring,
} from './useContentEditorState';
export function ContentEditorWired(props: ContentEditorWiring) {
  const state = useContentEditorState(props);
  return <ContentEditor {...state} />;
}
