import { useEffect, useSyncExternalStore } from 'react';
import { useExperienceService } from '../../hooks/useExperienceService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface ExperienceWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useExperienceState({
  services,
  editor = false,
}: ExperienceWiring) {
  const controller = useExperienceService({ services });
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
    edit: controller.edit,
    close: controller.close,
    change: controller.change,
    reset: controller.reset,
    save: controller.save,
    remove: controller.remove,
  };
}
