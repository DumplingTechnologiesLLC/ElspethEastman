import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProjectsState } from '../useProjectsState';
import { mockServices } from '../../../../../test/mockServices';
it('subscribes to the service and exposes its view state', () => {
  const mock = mockServices();
  const hook = renderHook(useProjectsState, {
    initialProps: { services: mock.services },
  });
  expect(mock.projects.load).toHaveBeenCalledOnce();
  void hook.result.current.nextPage();
  expect(mock.projects.nextPage).toHaveBeenCalledOnce();
  act(() =>
    mock.projects.publish({ ...mock.projects.getSnapshot(), loaded: false }),
  );
  expect(hook.result.current.loaded).toBe(false);
  hook.unmount();
  expect(mock.projects.stop).toHaveBeenCalledOnce();
});
it('constructs an editor controller explicitly', () => {
  const mock = mockServices();
  const { result } = renderHook(useProjectsState, {
    initialProps: { services: mock.services, mode: 'editor' },
  });
  expect(result.current.mode).toBe('editor');
  expect(mock.services.projects).toHaveBeenCalledWith('editor');
});
