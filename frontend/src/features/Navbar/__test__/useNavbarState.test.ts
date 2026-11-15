import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNavbarState } from '../useNavbarState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(useNavbarState, {
    initialProps: { services: mock.services, cms: false },
  });
  hook.result.current.onContact();
  expect(mock.contact.show).toHaveBeenCalledWith(true);
  act(() =>
    mock.session.publish({
      ...mock.session.getSnapshot(),
      authenticated: true,
    }),
  );
  expect(hook.result.current.authenticated).toBe(true);
  hook.unmount();
  expect(mock.session.stop).toHaveBeenCalledOnce();
});
