import { useEffect, useSyncExternalStore } from 'react';
import { useFooterService } from '../../hooks/useFooterService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface FooterWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useFooterState({ services, editor = false }: FooterWiring) {
  const controller = useFooterService({ services });
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
