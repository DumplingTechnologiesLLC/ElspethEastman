import { useSyncExternalStore } from 'react';
import { useSessionService } from '../../hooks/useSessionService';
import { useContactService } from '../../hooks/useContactService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface NavbarWiring {
  services: ServiceContainer;
  cms: boolean;
}
export function useNavbarState({ services, cms }: NavbarWiring) {
  const session = useSessionService(services);
  const contact = useContactService(services);
  const state = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  return {
    cms,
    authenticated: state.authenticated,
    navigate: session.navigate,
    logout: session.logout,
    onContact: () => contact.show(true),
  };
}
