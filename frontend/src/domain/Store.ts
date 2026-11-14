import type { Readable } from './contracts';
export class Store<T> implements Readable<T> {
  private listeners = new Set<() => void>();
  constructor(private value: T) {}
  getSnapshot = () => this.value;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  protected set(value: T) {
    this.value = value;
    for (const listener of this.listeners) listener();
  }
  protected patch(patch: Partial<T>) {
    this.set({ ...this.value, ...patch });
  }
}
