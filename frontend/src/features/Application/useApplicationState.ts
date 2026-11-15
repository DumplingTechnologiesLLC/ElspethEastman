import { getApplicationView } from './getApplicationView';
import { useEffect, useSyncExternalStore } from 'react';
import { useSessionService } from '../../hooks/useSessionService';
import { useContactService } from '../../hooks/useContactService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

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
    ...getApplicationView(session.getPage()),
    onContact: () => contact.show(true),
  };
}
