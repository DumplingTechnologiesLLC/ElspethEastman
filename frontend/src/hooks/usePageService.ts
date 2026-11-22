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
  return services.page(pageId);
}
