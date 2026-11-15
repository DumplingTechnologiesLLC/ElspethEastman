import type { UIAlert } from '../models/UIAlert';
export interface UIAlerts {
  show: (alert: UIAlert) => void;
}
