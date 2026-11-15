import type { Readable } from './Readable';
import type { UIAlerts } from './UIAlerts';
import type { Toast } from '../models/Toast';
export interface Notifications extends Readable<readonly Toast[]>, UIAlerts {
  dismiss: (id: number) => void;
  dispose: () => void;
}
