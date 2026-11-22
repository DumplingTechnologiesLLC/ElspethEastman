import { expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fixturePorts } from '../../../../test/fakes';
import { useContentEditorService } from '../useContentEditorService';
it('uses the editor for the current page and service owner after rerender', () => {
  const first = fixturePorts().services();
  const second = fixturePorts().services();
  const home = '00000000-0000-4000-8000-000000000001';
  const voice = '00000000-0000-4000-8000-000000000002';
  const { result, rerender } = renderHook(useContentEditorService, {
    initialProps: { services: first, pageId: home },
  });
  expect(result.current).toBe(first.editor(home));
  rerender({ services: first, pageId: voice });
  expect(result.current).toBe(first.editor(voice));
  rerender({ services: second, pageId: voice });
  expect(result.current).toBe(second.editor(voice));
});
