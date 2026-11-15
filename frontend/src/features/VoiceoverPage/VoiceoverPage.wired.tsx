import type { ContentPageWiring } from '../../hooks/useContentPage';
import { VoiceoverPage } from './VoiceoverPage.presentational';
import { useVoiceoverPageState } from './useVoiceoverPageState';
export function VoiceoverPageWired(props: ContentPageWiring) {
  const state = useVoiceoverPageState(props);
  return <VoiceoverPage {...state} />;
}
