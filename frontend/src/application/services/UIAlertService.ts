import type { UIAlert } from '../../domain/models/UIAlert';
import type { Clock } from '../../domain/ports/Clock';
import type { Notifications } from '../../domain/ports/Notifications';
import type { Toast } from '../../domain/models/Toast';
import { Store } from './Store';
export class UIAlertService
  extends Store<readonly Toast[]>
  implements Notifications
{
  private nextId = 0;
  private timers = new Map<number, () => void>();
  constructor(private clock: Clock) {
    super([]);
  }
  show = (alert: UIAlert) => {
    const id = ++this.nextId;
    this.set([...this.getSnapshot(), { id, ...alert }]);
    this.timers.set(
      id,
      this.clock.later(() => this.dismiss(id), 6000),
    );
  };
  dismiss = (id: number) => {
    this.timers.get(id)?.();
    this.timers.delete(id);
    this.set(this.getSnapshot().filter((toast) => toast.id !== id));
  };
  dispose = () => {
    for (const cancel of this.timers.values()) cancel();
    this.timers.clear();
  };
}
