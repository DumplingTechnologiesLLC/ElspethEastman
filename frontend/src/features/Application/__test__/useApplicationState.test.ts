import { it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplicationState } from '../useApplicationState';
import { mockServices } from '../../../../../test/mockServices';
it.each([
  ['/', false, 'home', false, 'latest', false],
  ['/cms', true, 'cms', true, 'editor', true],
  ['/cms', false, 'login', true, 'latest', false],
  ['/login', false, 'login', true, 'latest', false],
  ['/projects', false, 'projects', false, 'all', false],
] as const)(
  'selects %s authenticated=%s',
  (path, authenticated, page, cms, mode, editor) => {
    const mock = mockServices();
    mock.session.publish({
      ...mock.session.getSnapshot(),
      path,
      authenticated,
    });
    mock.session.getPage.mockReturnValue(page);
    const hook = renderHook(useApplicationState, {
      initialProps: { services: mock.services },
    });
    expect(hook.result.current.page).toBe(page);
    expect(hook.result.current.navbarProps).toEqual({ cms });
    expect(hook.result.current.projectsProps).toEqual({ mode });
    expect(hook.result.current.skillsProps).toEqual({ editor });
    expect(hook.result.current.experienceProps).toEqual({ editor });
    expect(hook.result.current.footerProps).toEqual({ editor });
    expect(mock.session.start).toHaveBeenCalledOnce();
    hook.result.current.onContact();
    expect(mock.contact.show).toHaveBeenCalledWith(true);
    hook.unmount();
    expect(mock.stopSession).toHaveBeenCalledOnce();
  },
);
