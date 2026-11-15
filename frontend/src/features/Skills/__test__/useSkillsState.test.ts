import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSkillsState } from '../useSkillsState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(useSkillsState, {
    initialProps: { services: mock.services },
  });
  expect(mock.skills.load).toHaveBeenCalledOnce();
  act(() =>
    mock.skills.publish({ ...mock.skills.getSnapshot(), loaded: false }),
  );
  expect(hook.result.current.loaded).toBe(false);
  hook.unmount();
  expect(mock.skills.stop).toHaveBeenCalledOnce();
});
it('constructs an editor controller explicitly', () => {
  const mock = mockServices();
  const { result } = renderHook(useSkillsState, {
    initialProps: { services: mock.services, editor: true },
  });
  expect(result.current.editor).toBe(true);
});
