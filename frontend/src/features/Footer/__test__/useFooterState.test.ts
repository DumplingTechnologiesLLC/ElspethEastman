import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFooterState } from '../useFooterState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(() => useFooterState({ services: mock.services }));
  expect(mock.footer.load).toHaveBeenCalledOnce();
  act(() =>
    mock.footer.publish({ ...mock.footer.getSnapshot(), loaded: false }),
  );
  expect(hook.result.current.loaded).toBe(false);
  hook.unmount();
  expect(mock.footer.stop).toHaveBeenCalledOnce();
});
it('constructs an editor controller explicitly', () => {
  const mock = mockServices();
  const { result } = renderHook(() =>
    useFooterState({ services: mock.services, editor: true }),
  );
  expect(result.current.editor).toBe(true);
});
