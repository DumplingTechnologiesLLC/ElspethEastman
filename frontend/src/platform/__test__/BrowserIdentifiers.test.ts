import { expect, it, vi } from 'vitest';
import { BrowserIdentifiers } from '../BrowserIdentifiers';
it('allocates public UUIDs through its owning cryptographic source', () => {
  const first = '00000000-0000-4000-8000-000000000001';
  const second = '00000000-0000-4000-8000-000000000002';
  const randomUUID = vi
    .fn<Crypto['randomUUID']>()
    .mockReturnValueOnce(first)
    .mockReturnValueOnce(second);
  const crypto = { randomUUID };
  const identifiers = new BrowserIdentifiers(crypto);
  expect(identifiers.next()).toBe(first);
  expect(identifiers.next()).toBe(second);
  expect(randomUUID.mock.contexts).toEqual([crypto, crypto]);
});
