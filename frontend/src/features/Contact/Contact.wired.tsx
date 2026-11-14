import { useContactState, type ContactWiring } from './useContactState';
import { Contact } from './Contact.presentational';
export function ContactWired(props: ContactWiring) {
  const state = useContactState(props);
  return <Contact {...state} />;
}
