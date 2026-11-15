import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../test/mockServices';
import { useContentPage } from '../useContentPage';
it('owns a page subscription and exposes scoped ports to page-specific projections', () => {
  const { services, page, site, editor } = mockServices();
  const hook = renderHook(useContentPage, {
    initialProps: { services, pageId: 1, editor: true },
  });
  expect(page.start).toHaveBeenCalledOnce();
  expect(hook.result.current.page).toBe(page);
  expect(hook.result.current.editor).toBe(editor);
  expect(hook.result.current.site).toBe(site);
  act(() => page.publish({ ...page.getSnapshot(), status: 'loading' }));
  expect(hook.result.current.state.status).toBe('loading');
  act(() => site.publish({ ...site.getSnapshot(), path: '/cms' }));
  expect(hook.result.current.registry.path).toBe('/cms');
  hook.unmount();
  expect(page.stop).toHaveBeenCalledOnce();
  expect(site.stop).toHaveBeenCalledOnce();
});
