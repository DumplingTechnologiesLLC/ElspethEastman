import type { ContentPageWiring } from '../../hooks/useContentPage';
import { PressPage } from './PressPage.presentational';
import { usePressPageState } from './usePressPageState';
export function PressPageWired(props: ContentPageWiring) {
  const state = usePressPageState(props);
  return <PressPage {...state} />;
}
