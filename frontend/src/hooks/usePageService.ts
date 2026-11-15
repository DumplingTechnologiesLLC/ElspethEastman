import { useState } from 'react';
import type { ServiceContainer } from '../composition/ServiceContainer';
import type { PageId } from '../domain/models/Page';
import type { PageController } from '../domain/ports/PageController';

export function usePageService({
  services,
  pageId,
}: {
  services: ServiceContainer;
  pageId: PageId;
}): PageController {
  const [service] = useState(() => services.page(pageId));
  return service;
}
