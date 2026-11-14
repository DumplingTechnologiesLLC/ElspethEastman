import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useExperienceState } from '../useExperienceState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(() =>
    useExperienceState({ services: mock.services }),
  );
  expect(mock.experience.load).toHaveBeenCalledOnce();
  act(() =>
    mock.experience.publish({
      ...mock.experience.getSnapshot(),
      loaded: false,
    }),
  );
  expect(hook.result.current.loaded).toBe(false);
  hook.unmount();
  expect(mock.experience.stop).toHaveBeenCalledOnce();
});
it('constructs an editor controller explicitly', () => {
  const mock = mockServices();
  const { result } = renderHook(() =>
    useExperienceState({ services: mock.services, editor: true }),
  );
  expect(result.current.editor).toBe(true);
});
