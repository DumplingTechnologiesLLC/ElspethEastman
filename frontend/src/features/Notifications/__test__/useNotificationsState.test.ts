import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNotificationsState } from '../useNotificationsState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(() =>
    useNotificationsState({ services: mock.services }),
  );
  act(() => mock.notifications.publish([]));
  expect(hook.result.current.toasts).toEqual([]);
  hook.unmount();
  expect(mock.notifications.stop).toHaveBeenCalledOnce();
});
