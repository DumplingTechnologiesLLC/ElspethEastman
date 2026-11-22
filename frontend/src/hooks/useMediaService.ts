import type { ServiceContainer } from '../composition/ServiceContainer';
import type { MediaController } from '../domain/ports/MediaController';
export function useMediaService(services: ServiceContainer): MediaController {
  return services.media;
}
