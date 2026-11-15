// oxlint-disable-next-line import/no-unassigned-import -- Installs the RTL matchers in Vitest.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { installDom } from './dom';
beforeEach(() => {
  if (typeof window !== 'undefined') installDom();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
