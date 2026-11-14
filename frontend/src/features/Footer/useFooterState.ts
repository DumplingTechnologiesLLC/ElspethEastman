import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  useFooterService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface FooterWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useFooterState({ services, editor = false }: FooterWiring) {
  const create = useFooterService(services);
  const [controller] = useState(create);
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    void controller.load();
  }, [controller]);
  return {
    editor,
    ...state,
    change: controller.change,
    reset: controller.reset,
    show: controller.show,
    save: controller.save,
    remove: controller.remove,
  };
}
