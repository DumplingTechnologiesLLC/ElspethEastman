import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  useSkillsService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface SkillsWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useSkillsState({ services, editor = false }: SkillsWiring) {
  const create = useSkillsService(services);
  const [controller] = useState(() => create(editor));
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
    select: controller.select,
    change: controller.change,
    reset: controller.reset,
    save: controller.save,
  };
}
