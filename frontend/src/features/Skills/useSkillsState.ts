import { useEffect, useSyncExternalStore } from 'react';
import { useSkillsService } from '../../hooks/useSkillsService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface SkillsWiring {
  services: ServiceContainer;
  editor?: boolean;
}
export function useSkillsState({ services, editor = false }: SkillsWiring) {
  const controller = useSkillsService({ services, editor });
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
