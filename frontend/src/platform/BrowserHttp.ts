import type { Http } from '../domain/ports/Http';
import type { Method } from '../domain/models/Method';
import type { Reply } from '../domain/models/Reply';
import type { TokenStorage } from '../domain/ports/TokenStorage';
export function cookie(cookies: string, name: string): string | null {
  const entry = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}
export class BrowserHttp implements Http {
  private csrfBootstrap: Promise<Response> | undefined;
  constructor(
    private fetcher: typeof fetch,
    private cookies: () => string,
    private tokens: TokenStorage,
  ) {}
  private async csrfToken(): Promise<string | null> {
    const existing = cookie(this.cookies(), 'csrftoken');
    if (existing !== null) return existing;
    try {
      this.csrfBootstrap ??= this.fetcher('/api/v2/session/', {
        credentials: 'same-origin',
      });
      await this.csrfBootstrap;
      return cookie(this.cookies(), 'csrftoken');
    } finally {
      this.csrfBootstrap = undefined;
    }
  }
  async request<T>(
    path: string,
    method: Method = 'GET',
    body?: unknown,
    authenticated = false,
    responseType: 'json' | 'status' | 'content' = 'json',
  ): Promise<Reply<T | null>> {
    try {
      const token = authenticated ? this.tokens.read() : null;
      const csrf =
        method === 'GET'
          ? cookie(this.cookies(), 'csrftoken')
          : await this.csrfToken();
      const multipart = body instanceof FormData;
      const headers: Record<string, string> = {
        ...(!multipart ? { 'Content-Type': 'application/json' } : {}),
        'X-CSRFToken': csrf ?? 'null',
      };
      if (authenticated) headers.Authorization = `Token ${token}`;
      const response = await this.fetcher(
        path,
        method === 'GET'
          ? undefined
          : {
              method,
              cache: 'no-cache',
              headers,
              ...(authenticated ? { credentials: 'same-origin' as const } : {}),
              ...(body !== undefined
                ? { body: multipart ? body : JSON.stringify(body) }
                : {}),
            },
      );
      switch (responseType) {
        case 'status':
          if (method === 'GET' && !response.ok)
            return { status: null, data: null };
          return { status: response.status, data: null };
        case 'content':
          return {
            status: response.status,
            data:
              response.status === 204
                ? null
                : ((await response.json().catch(() => null)) as T | null),
          };
        case 'json':
          if (method === 'GET' && !response.ok)
            return { status: null, data: null };
          return {
            status: response.status,
            data: (await response.json()) as T,
          };
      }
    } catch {
      return { status: null, data: null };
    }
  }
}
