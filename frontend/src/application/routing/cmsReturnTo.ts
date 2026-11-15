const origin = 'https://portfolio.invalid';

export function cmsReturnTo(value: string | null): string {
  try {
    const url = new URL(value ?? '/cms', origin);
    if (
      url.origin !== origin ||
      (url.pathname !== '/cms' && !url.pathname.startsWith('/cms/'))
    )
      return '/cms';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/cms';
  }
}

export function loginReturnTo(path: string): string {
  return cmsReturnTo(new URL(path, origin).searchParams.get('returnTo'));
}
