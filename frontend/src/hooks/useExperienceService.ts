import type { ServiceContainer } from '../composition/ServiceContainer';
import type { ExperienceController } from '../domain/ports/ExperienceController';
import { useState } from 'react';
export function useExperienceService({
  services,
}: {
  services: ServiceContainer;
}): ExperienceController {
  const [service] = useState(() => services.experience());
  return service;
}
