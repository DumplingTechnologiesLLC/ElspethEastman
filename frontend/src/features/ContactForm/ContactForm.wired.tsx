import { ContactForm } from './ContactForm.presentational';
import {
  useContactFormState,
  type ContactFormWiring,
} from './useContactFormState';
export function ContactFormWired(props: ContactFormWiring) {
  const state = useContactFormState(props);
  return <ContactForm {...state} />;
}
