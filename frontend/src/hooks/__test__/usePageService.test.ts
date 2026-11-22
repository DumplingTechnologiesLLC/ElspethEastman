import { expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fixturePorts } from '../../../../test/fakes';
import { usePageService } from '../usePageService';

it('rebinds to the controller for the current page and owning service container', () => {
  const first = fixturePorts().services();
  const second = fixturePorts().services();
  const home = '00000000-0000-4000-8000-000000000001';
  const voice = '00000000-0000-4000-8000-000000000002';
  const { result, rerender } = renderHook(usePageService, {
    initialProps: { services: first, pageId: home },
  });
  expect(result.current).toBe(first.page(home));
  rerender({ services: first, pageId: voice });
  expect(result.current).toBe(first.page(voice));
  rerender({ services: second, pageId: voice });
  expect(result.current).toBe(second.page(voice));
});
