export interface ContentFailure {
  readonly status: number | null;
  readonly detail: string;
  readonly fields: Readonly<Record<string, readonly string[]>>;
}
export type ContentResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ContentFailure };
