import type { ServiceContainer } from '../composition/ServiceContainer';
import type { Session } from '../domain/ports/Session';
export function useSessionService(services: ServiceContainer): Session {
  return services.session;
}
