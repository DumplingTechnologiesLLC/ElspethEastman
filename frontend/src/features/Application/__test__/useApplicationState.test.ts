import { it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplicationState } from '../useApplicationState';
import { mockServices } from '../../../../../test/mockServices';
it.each([
  ['/', false, 'home'],
  ['/cms', true, 'cms'],
  ['/cms', false, 'login'],
  ['/login', false, 'login'],
  ['/projects', false, 'projects'],
])('selects %s authenticated=%s', (path, authenticated, page) => {
  const mock = mockServices();
  mock.session.publish({
    ...mock.session.getSnapshot(),
    path: path as string,
    authenticated: authenticated as boolean,
  });
  mock.session.getPage.mockReturnValue(
    page as import('../../../domain/contracts').ApplicationPage,
  );
  const hook = renderHook(() =>
    useApplicationState({ services: mock.services }),
  );
  expect(hook.result.current.page).toBe(page);
  expect(mock.session.start).toHaveBeenCalledOnce();
  hook.result.current.onContact();
  expect(mock.contact.show).toHaveBeenCalledWith(true);
  hook.unmount();
  expect(mock.stopSession).toHaveBeenCalledOnce();
});
