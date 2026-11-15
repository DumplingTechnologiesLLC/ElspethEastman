import type { UIAlert } from '../../domain/models/UIAlert';
export function getRequestAlert(status: number | null): UIAlert | undefined {
  switch (status) {
    case null:
      return { title: 'Error', content: 'Network error', flavor: 'error' };
    case 500:
      return {
        title: 'Error',
        content: 'There was a server error. Please try again later',
        flavor: 'error',
      };
    case 403:
      return {
        title: 'Forbidden',
        content: 'Your session has expired. Please log in again.',
        flavor: 'error',
      };
    default:
      return undefined;
  }
}
