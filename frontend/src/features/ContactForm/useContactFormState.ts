import { useSyncExternalStore } from 'react';
import type { ServiceContainer } from '../../composition/ServiceContainer';
import { useContactService } from '../../hooks/useContactService';
export interface ContactFormWiring {
  readonly services: ServiceContainer;
}
export function useContactFormState({ services }: ContactFormWiring) {
  const contact = useContactService(services);
  const state = useSyncExternalStore(
    contact.subscribe,
    contact.getSnapshot,
    contact.getSnapshot,
  );
  return {
    draft: state.draft,
    errors: Object.fromEntries(
      Object.entries(state.errors).map(
        ([key, error]) =>
          [key, Array.isArray(error) ? error.join(' ') : error] as const,
      ),
    ),
    submitting: state.submitting,
    change: contact.change,
    submit: contact.submit,
  };
}
