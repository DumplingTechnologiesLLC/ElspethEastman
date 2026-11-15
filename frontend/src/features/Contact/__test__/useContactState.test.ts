import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useContactState } from '../useContactState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(useContactState, {
    initialProps: { services: mock.services },
  });
  act(() =>
    mock.contact.publish({ ...mock.contact.getSnapshot(), open: false }),
  );
  expect(hook.result.current.open).toBe(false);
  hook.unmount();
  expect(mock.contact.stop).toHaveBeenCalledOnce();
});
