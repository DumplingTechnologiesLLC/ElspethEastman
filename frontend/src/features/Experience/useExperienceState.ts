import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  useExperienceService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface ExperienceWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useExperienceState({
  services,
  editor = false,
}: ExperienceWiring) {
  const create = useExperienceService(services);
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
    edit: controller.edit,
    close: controller.close,
    change: controller.change,
    reset: controller.reset,
    save: controller.save,
    remove: controller.remove,
  };
}
