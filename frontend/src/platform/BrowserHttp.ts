import type { Http, Method, Reply, TokenStorage } from '../domain/contracts';
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
      this.csrfBootstrap ??= this.fetcher('/api/session/', {
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
    responseType: 'json' | 'status' = 'json',
  ): Promise<Reply<T>> {
    try {
      const csrf =
        method === 'GET'
          ? cookie(this.cookies(), 'csrftoken')
          : await this.csrfToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf ?? 'null',
      };
      if (authenticated) headers.Authorization = `Token ${this.tokens.read()}`;
      const response = await this.fetcher(
        path,
        method === 'GET'
          ? undefined
          : {
              method,
              cache: 'no-cache',
              headers,
              ...(authenticated ? { credentials: 'same-origin' as const } : {}),
              ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
            },
      );
      if (method === 'GET' && !response.ok)
        return { status: null, data: null as T };
      if (responseType === 'status')
        return { status: response.status, data: null as T };
      return { status: response.status, data: (await response.json()) as T };
    } catch {
      return { status: null, data: null as T };
    }
  }
}
