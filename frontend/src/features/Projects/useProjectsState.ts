import { toProjectViewModel } from './toProjectViewModel';
import { useEffect, useSyncExternalStore } from 'react';
import { useProjectsService } from '../../hooks/useProjectsService';
import { useSessionService } from '../../hooks/useSessionService';
import type { ServiceContainer } from '../../composition/ServiceContainer';

export interface ProjectsWiring {
  services: ServiceContainer;
  mode?: 'latest' | 'all' | 'editor';
}
export function useProjectsState({
  services,
  mode = 'latest',
}: ProjectsWiring) {
  const session = useSessionService(services);
  const controller = useProjectsService({ services, mode });
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    void controller.load();
  }, [controller]);
  return {
    mode,
    ...state,
    projects: state.projects.map(toProjectViewModel),
    draft: toProjectViewModel(state.draft),
    change: controller.change,
    reset: controller.reset,
    show: controller.show,
    save: controller.save,
    saveAll: controller.saveAll,
    remove: controller.remove,
    nextPage: controller.nextPage,
    navigate: session.navigate,
  };
}
