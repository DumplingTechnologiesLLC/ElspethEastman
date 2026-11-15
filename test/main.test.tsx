import { it, expect, vi } from 'vitest';
const roots = vi.hoisted(() => ({
  render: vi.fn(),
  unmount: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('react-dom/client', () => ({ createRoot: vi.fn(() => roots) }));
vi.mock('../frontend/src/platform/browserServices', () => ({
  browserServices: vi.fn(() => ({ dispose: roots.dispose })),
}));
it('mounts and disposes an owned browser root', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  const { mount } = await import('../frontend/src/main');
  expect(roots.render).toHaveBeenCalledOnce();
  const dispose = mount(document.getElementById('root')!, window);
  expect(roots.render).toHaveBeenCalledTimes(2);
  dispose();
  expect(roots.unmount).toHaveBeenCalledOnce();
  expect(roots.dispose).toHaveBeenCalledOnce();
});
