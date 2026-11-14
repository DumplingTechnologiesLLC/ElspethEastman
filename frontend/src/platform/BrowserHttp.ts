import type { Http, Method, Reply, TokenStorage } from '../domain/contracts';
export function cookie(cookies: string, name: string): string | null {
  const entry = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}
export class BrowserHttp implements Http {
  constructor(
    private fetcher: typeof fetch,
    private cookies: () => string,
    private tokens: TokenStorage,
  ) {}
  async request<T>(
    path: string,
    method: Method = 'GET',
    body?: unknown,
    authenticated = false,
  ): Promise<Reply<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRFToken': cookie(this.cookies(), 'csrftoken') ?? 'null',
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
      return { status: response.status, data: (await response.json()) as T };
    } catch {
      return { status: null, data: null as T };
    }
  }
}
