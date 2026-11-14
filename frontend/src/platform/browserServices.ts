import { createServiceContainer } from '../domain/ServiceContainer';
import type { Clock, Navigation, TokenStorage } from '../domain/contracts';
import { BrowserHttp } from './BrowserHttp';
export const tokenKey = 'ElspethEastmanAuthToken';
/** Browser effects are bound here so domain services also run without a DOM. */
export function browserServices(browser: Window) {
  const tokens: TokenStorage = {
    read: () => browser.sessionStorage.getItem(tokenKey),
    write: (token) => {
      if (token) browser.sessionStorage.setItem(tokenKey, token);
      else browser.sessionStorage.removeItem(tokenKey);
    },
    listen: (callback) => {
      browser.addEventListener('storage', callback);
      return () => browser.removeEventListener('storage', callback);
    },
  };
  const listeners = new Set<() => void>();
  const publish = () => {
    for (const listener of listeners) listener();
  };
  const navigation: Navigation = {
    location: () => browser.location.pathname + browser.location.hash,
    go: (path) => {
      browser.history.pushState(null, '', path);
      publish();
    },
    listen: (callback) => {
      listeners.add(callback);
      browser.addEventListener('popstate', callback);
      return () => {
        listeners.delete(callback);
        browser.removeEventListener('popstate', callback);
      };
    },
  };
  const clock: Clock = {
    now: () => Date.now(),
    later: (callback, milliseconds) => {
      const id = browser.setTimeout(callback, milliseconds);
      return () => browser.clearTimeout(id);
    },
  };
  return createServiceContainer({
    http: new BrowserHttp(
      browser.fetch.bind(browser),
      () => browser.document.cookie,
      tokens,
    ),
    tokens,
    navigation,
    clock,
    confirm: () =>
      browser.confirm(
        'Are you sure you want to delete this item? This action cannot be undone.',
      ),
  });
}
