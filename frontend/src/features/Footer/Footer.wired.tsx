import { useFooterState, type FooterWiring } from './useFooterState';
import { Footer } from './Footer.presentational';
export function FooterWired(props: FooterWiring) {
  const state = useFooterState(props);
  return <Footer {...state} />;
}
