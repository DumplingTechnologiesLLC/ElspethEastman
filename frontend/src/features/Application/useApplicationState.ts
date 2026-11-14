import { useEffect, useSyncExternalStore } from 'react';
import {
  useSessionService,
  useContactService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface ApplicationWiring {
  services: ServiceContainer;
}
export function useApplicationState({ services }: ApplicationWiring) {
  const session = useSessionService(services);
  const contact = useContactService(services);
  useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  useEffect(() => session.start(), [session]);
  return {
    page: session.getPage(),
    onContact: () => contact.show(true),
  };
}
