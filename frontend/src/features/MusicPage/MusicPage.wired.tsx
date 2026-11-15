import type { ContentPageWiring } from '../../hooks/useContentPage';
import { MusicPage } from './MusicPage.presentational';
import { useMusicPageState } from './useMusicPageState';
export function MusicPageWired(props: ContentPageWiring) {
  const state = useMusicPageState(props);
  return <MusicPage {...state} />;
}
