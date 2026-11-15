import { useSyncExternalStore } from 'react';
import { useSessionService } from '../../hooks/useSessionService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface LoginWiring {
  services: ServiceContainer;
}
export function useLoginState({ services }: LoginWiring) {
  const controller = useSessionService(services);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return { ...state, change: controller.change, login: controller.login };
}
