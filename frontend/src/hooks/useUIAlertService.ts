import type { ServiceContainer } from '../composition/ServiceContainer';
import type { Notifications } from '../domain/ports/Notifications';
export function useUIAlertService(services: ServiceContainer): Notifications {
  return services.notifications;
}
