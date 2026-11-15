import type { ContentPageWiring } from '../../hooks/useContentPage';
import { BioPage } from './BioPage.presentational';
import { useBioPageState } from './useBioPageState';
export function BioPageWired(props: ContentPageWiring) {
  const state = useBioPageState(props);
  return <BioPage {...state} />;
}
