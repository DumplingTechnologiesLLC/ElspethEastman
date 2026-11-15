import type { ServiceContainer } from '../composition/ServiceContainer';
import type { SkillsController } from '../domain/ports/SkillsController';
import { useState } from 'react';
export function useSkillsService({
  services,
  editor,
}: {
  services: ServiceContainer;
  editor: boolean;
}): SkillsController {
  const [service] = useState(() => services.skills(editor));
  return service;
}
