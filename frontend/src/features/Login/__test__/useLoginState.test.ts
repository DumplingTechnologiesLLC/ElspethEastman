import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLoginState } from '../useLoginState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(useLoginState, {
    initialProps: { services: mock.services },
  });
  act(() =>
    mock.session.publish({
      ...mock.session.getSnapshot(),
      username: 'Updated',
    }),
  );
  expect(hook.result.current.username).toBe('Updated');
  hook.unmount();
  expect(mock.session.stop).toHaveBeenCalledOnce();
});
