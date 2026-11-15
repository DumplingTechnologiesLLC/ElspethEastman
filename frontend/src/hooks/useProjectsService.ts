import type { ServiceContainer } from '../composition/ServiceContainer';
import type { ProjectsController } from '../domain/ports/ProjectsController';
import { useState } from 'react';
export function useProjectsService({
  services,
  mode,
}: {
  services: ServiceContainer;
  mode: 'latest' | 'all' | 'editor';
}): ProjectsController {
  const [service] = useState(() => services.projects(mode));
  return service;
}
