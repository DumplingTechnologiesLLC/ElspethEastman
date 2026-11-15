import type { ServiceContainer } from '../composition/ServiceContainer';
import type { Contact } from '../domain/ports/Contact';
export function useContactService(services: ServiceContainer): Contact {
  return services.contact;
}
