import type { ContentPageWiring } from '../../hooks/useContentPage';
import { StreamingPage } from './StreamingPage.presentational';
import { useStreamingPageState } from './useStreamingPageState';
export function StreamingPageWired(props: ContentPageWiring) {
  const state = useStreamingPageState(props);
  return <StreamingPage {...state} />;
}
