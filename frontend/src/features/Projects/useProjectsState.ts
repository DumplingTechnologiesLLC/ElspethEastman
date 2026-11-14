import { projectView } from '../../domain/projectView';
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  useProjectsService,
  useSessionService,
  type ServiceContainer,
} from '../../domain/ServiceContainer';
export interface ProjectsWiring {
  services: ServiceContainer;
  mode?: 'latest' | 'all' | 'editor';
}
export function useProjectsState({
  services,
  mode = 'latest',
}: ProjectsWiring) {
  const create = useProjectsService(services);
  const session = useSessionService(services);
  const [controller] = useState(() => create(mode));
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
    projects: state.projects.map(projectView),
    draft: projectView(state.draft),
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
