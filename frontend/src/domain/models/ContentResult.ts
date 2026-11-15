export interface ContentFailure {
  readonly status: number | null;
  readonly detail: string;
  readonly fields: Readonly<Record<string, readonly string[]>>;
}
export interface ContentRejection {
  readonly ok: false;
  readonly error: ContentFailure;
}
export function rejectContent(detail: string): ContentRejection {
  return { ok: false, error: { status: null, detail, fields: {} } };
}
export type ContentResult<T> =
  { readonly ok: true; readonly value: T } | ContentRejection;
