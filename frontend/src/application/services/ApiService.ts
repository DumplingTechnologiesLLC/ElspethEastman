import { getRequestAlert } from '../alerts/getRequestAlert';
import type { Http } from '../../domain/ports/Http';
import type { Method } from '../../domain/models/Method';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { Reply } from '../../domain/models/Reply';
import type { Api } from '../../domain/ports/Api';

export class ApiService implements Api {
  constructor(
    private http: Http,
    private notifications: UIAlerts,
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
    const alert = getRequestAlert(reply.status);
    if (alert) {
      this.notifications.show(alert);
      return { status: null, data: null };
    }
    return reply;
  }
}
