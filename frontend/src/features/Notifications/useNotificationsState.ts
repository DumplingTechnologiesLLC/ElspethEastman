import { useSyncExternalStore } from 'react';
import {
  useNotificationService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface NotificationsWiring {
  services: ServiceContainer;
}
export function useNotificationsState({ services }: NotificationsWiring) {
  const controller = useNotificationService(services);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return { toasts: state };
}
