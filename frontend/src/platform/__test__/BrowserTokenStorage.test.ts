import { expect, it, vi } from 'vitest';
import { BrowserTokenStorage } from '../BrowserTokenStorage';

it('tracks each local credential write and external credential changes', () => {
  window.sessionStorage.clear();
  const tokens = new BrowserTokenStorage(window, 'review-token');
  expect(tokens.revision()).toBe(0);
  tokens.write('first');
  expect(tokens.read()).toBe('first');
  expect(tokens.revision()).toBe(1);
  tokens.write('first');
  expect(tokens.revision()).toBe(2);
  window.sessionStorage.setItem('review-token', 'external');
  expect(tokens.revision()).toBe(3);
  expect(tokens.read()).toBe('external');
  tokens.write(null);
  expect(tokens.read()).toBeNull();
  expect(tokens.revision()).toBe(4);
  const changed = vi.fn();
  const stop = tokens.listen(changed);
  window.dispatchEvent(new StorageEvent('storage'));
  expect(changed).toHaveBeenCalledOnce();
  stop();
  window.dispatchEvent(new StorageEvent('storage'));
  expect(changed).toHaveBeenCalledOnce();
});
