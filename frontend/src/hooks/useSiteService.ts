import type { ServiceContainer } from '../composition/ServiceContainer';
import type { SiteController } from '../domain/ports/SiteController';

export function useSiteService(services: ServiceContainer): SiteController {
  return services.site;
}
