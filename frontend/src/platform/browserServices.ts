import { BrowserIdentifiers } from './BrowserIdentifiers';
import { createServiceContainer } from '../composition/createServiceContainer';

import type { Clock } from '../domain/ports/Clock';
import type { Navigation } from '../domain/ports/Navigation';
import { BrowserTokenStorage } from './BrowserTokenStorage';
import { BrowserHttp } from './BrowserHttp';
export const tokenKey = 'ElspethEastmanAuthToken';
/** Browser effects are bound here so domain services also run without a DOM. */
export function browserServices(browser: Window) {
  const tokens = new BrowserTokenStorage(browser, tokenKey);
  const listeners = new Set<() => void>();
  const publish = () => {
    for (const listener of listeners) listener();
  };
  const navigation: Navigation = {
    location: () =>
      browser.location.pathname +
      browser.location.search +
      browser.location.hash,
    go: (path) => {
      browser.history.pushState(null, '', path);
      publish();
    },
    replace: (path) => {
      browser.history.replaceState(null, '', path);
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
    identifiers: new BrowserIdentifiers(browser.crypto),
    navigation,
    clock,
    confirm: () =>
      browser.confirm(
        'Are you sure you want to delete this item? This action cannot be undone.',
      ),
  });
}
