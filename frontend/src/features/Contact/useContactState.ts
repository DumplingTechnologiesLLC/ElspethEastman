import { useSyncExternalStore } from 'react';
import {
  useContactService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface ContactWiring {
  services: ServiceContainer;
}
export function useContactState({ services }: ContactWiring) {
  const controller = useContactService(services);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return {
    ...state,
    change: controller.change,
    show: controller.show,
    submit: controller.submit,
  };
}
