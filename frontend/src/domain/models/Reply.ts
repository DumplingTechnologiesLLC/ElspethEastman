export interface Reply<T> {
  status: number | null;
  data: T;
}
