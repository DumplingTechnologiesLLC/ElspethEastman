import type { ServiceContainer } from '../composition/ServiceContainer';
import type { FooterController } from '../domain/ports/FooterController';
import { useState } from 'react';
export function useFooterService({
  services,
}: {
  services: ServiceContainer;
}): FooterController {
  const [service] = useState(() => services.footer());
  return service;
}
