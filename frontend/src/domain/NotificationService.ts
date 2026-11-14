import type { Clock, Notifications, Toast } from './contracts';
import { Store } from './Store';
export class NotificationService
  extends Store<readonly Toast[]>
  implements Notifications
{
  private nextId = 0;
  private timers = new Map<number, () => void>();
  constructor(private clock: Clock) {
    super([]);
  }
  show = (title: string, content: string, flavor: Toast['flavor']) => {
    const id = ++this.nextId;
    this.set([...this.getSnapshot(), { id, title, content, flavor }]);
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
