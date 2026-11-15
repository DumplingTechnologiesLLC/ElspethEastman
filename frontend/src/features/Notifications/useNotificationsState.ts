import { useSyncExternalStore } from 'react';
import { useUIAlertService } from '../../hooks/useUIAlertService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface NotificationsWiring {
  services: ServiceContainer;
}
export function useNotificationsState({ services }: NotificationsWiring) {
  const controller = useUIAlertService(services);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return { toasts: state };
}
