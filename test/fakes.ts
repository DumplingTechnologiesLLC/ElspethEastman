import { vi } from 'vitest';
import { createServiceContainer } from '../frontend/src/composition/createServiceContainer';

import type { Clock } from '../frontend/src/domain/ports/Clock';
import type { Http } from '../frontend/src/domain/ports/Http';
import type { Navigation } from '../frontend/src/domain/ports/Navigation';
import type { Notifications } from '../frontend/src/domain/ports/Notifications';
import type { Reply } from '../frontend/src/domain/models/Reply';
import type { TokenStorage } from '../frontend/src/domain/ports/TokenStorage';
import type { Api } from '../frontend/src/domain/ports/Api';
export function fakeApi() {
  const replies: Reply<unknown>[] = [];
  const request = vi.fn<Api['request']>(async () => {
    const reply = replies.shift();
    if (!reply) throw new Error('No reply queued');
    return reply as never;
  });
  return { request: request as Api['request'], replies };
}
export function fakeNotifications(): Notifications {
  return {
    show: vi.fn(),
    dismiss: vi.fn(),
    dispose: vi.fn(),
    getSnapshot: () => [],
    subscribe: () => () => {},
  };
}
const noop = () => {};
export function fixturePorts() {
  let token: string | null = null;
  let path = '/';
  let navigationListener = noop;
  let storageListener = noop;
  const pending: {
    callback: () => void;
    milliseconds: number;
    cancel: ReturnType<typeof vi.fn>;
  }[] = [];
  const tokens: TokenStorage = {
    read: () => token,
    write: vi.fn((value) => {
      token = value;
    }),
    listen: vi.fn((callback) => {
      storageListener = callback;
      return vi.fn();
    }),
  };
  const navigation: Navigation = {
    location: () => path,
    go: vi.fn((value) => {
      path = value;
      navigationListener();
    }),
    listen: vi.fn((callback) => {
      navigationListener = callback;
      return vi.fn();
    }),
  };
  const clock: Clock = {
    now: () => Date.UTC(2026, 10, 14),
    later: vi.fn((callback, milliseconds) => {
      const cancel = vi.fn();
      pending.push({ callback, milliseconds, cancel });
      return cancel;
    }),
  };
  const http: Http = {
    request: vi.fn(
      async () => ({ status: 200, data: { isAuthenticated: false } }) as never,
    ),
  };
  const confirm = vi.fn(() => true);
  return {
    http,
    tokens,
    navigation,
    clock,
    confirm,
    pending,
    storageChanged: () => storageListener(),
    services: () =>
      createServiceContainer({ http, tokens, navigation, clock, confirm }),
  };
}
