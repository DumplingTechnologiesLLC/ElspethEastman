import type { ContentFailure } from '../../domain/models/ContentResult';
import type { Session } from '../../domain/ports/Session';
import type { UIAlerts } from '../../domain/ports/UIAlerts';

export function reportContentFailure(
  error: ContentFailure,
  alerts: UIAlerts,
  session: Pick<Session, 'expire'>,
  returnTo: string,
  includeValidation = false,
): void {
  if (error.status === 403) {
    session.expire(returnTo);
    return;
  }
  if (error.status === 400 && !includeValidation) return;
  const messages = Object.values(error.fields).flat();
  alerts.show({
    title: 'Could not save changes',
    content: messages.length > 0 ? messages.join(' ') : error.detail,
    flavor: 'error',
  });
}
