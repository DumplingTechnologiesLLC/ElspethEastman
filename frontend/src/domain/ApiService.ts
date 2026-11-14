import type { Http, Method, Notifications, Reply } from './contracts';
export interface Api {
  request: <T>(
    path: string,
    method?: Method,
    body?: unknown,
  ) => Promise<Reply<T | null>>;
}
export function announceFailure(
  notifications: Notifications,
  status: number | null,
): boolean {
  if (status === null) notifications.show('Error', 'Network error', 'error');
  else if (status === 500)
    notifications.show(
      'Error',
      'There was a server error. Please try again later',
      'error',
    );
  else if (status === 403)
    notifications.show(
      'Forbidden',
      'Your session has expired. Please log in again.',
      'error',
    );
  else return false;
  return true;
}
export class ApiService implements Api {
  constructor(
    private http: Http,
    private notifications: Notifications,
  ) {}
  async request<T>(
    path: string,
    method: Method = 'GET',
    body?: unknown,
  ): Promise<Reply<T | null>> {
    const reply = await this.http.request<T>(
      path,
      method,
      body,
      method !== 'GET' && path !== '/api/contact-me/',
    );
    return announceFailure(this.notifications, reply.status)
      ? { status: null, data: null }
      : reply;
  }
}
export function submissionToast(
  notifications: Notifications,
  status: number | null,
  missing: string,
) {
  if (status === 200)
    notifications.show('Success', 'Action submitted successfully.', 'success');
  else if (status === 400)
    notifications.show(
      'Error',
      'There was a problem with your submission',
      'error',
    );
  else if (status === 404) notifications.show('Error', missing, 'error');
}
