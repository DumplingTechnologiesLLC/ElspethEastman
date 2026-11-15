import type { ContentPageWiring } from '../../hooks/useContentPage';
import { ContactFormWired } from '../ContactForm/ContactForm.wired';
import { HomePage } from './HomePage.presentational';
import { useHomePageState } from './useHomePageState';
export function HomePageWired(props: ContentPageWiring) {
  const state = useHomePageState(props);
  return (
    <HomePage
      {...state}
      contact={<ContactFormWired services={props.services} />}
    />
  );
}
