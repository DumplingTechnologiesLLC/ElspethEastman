import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Navbar } from '../Navbar.presentational';
import { navbarView } from '../../../stories/viewModels';
import { frames } from '../../../../../test/dom';
it('delegates page navigation, in-page scrolling and contact without business services', () => {
  const navigate = vi.fn(),
    onContact = vi.fn(),
    scroll = vi.fn();
  const view = render(
    <Navbar {...navbarView} navigate={navigate} onContact={onContact} />,
  );
  fireEvent.click(screen.getByRole('link', { name: 'Latest Projects' }));
  expect(navigate).toHaveBeenCalledWith('/#latestProjects');
  const target = document.createElement('div');
  target.id = 'PageStart';
  target.scrollIntoView = scroll;
  view.container.appendChild(target);
  fireEvent.click(screen.getByRole('link', { name: 'About Me' }));
  fireEvent.click(view.container.querySelector('a')!);
  expect(scroll).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByText('Contact Me'));
  expect(onContact).toHaveBeenCalledOnce();
});
it('collapses and expands on mobile, follows breakpoint transitions and cleans listeners', () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
  const view = render(<Navbar {...navbarView} />);
  const list = view.container.querySelector('ul')!;
  expect(list.style.height).toBe('0px');
  const button = screen.getByRole('button');
  fireEvent.click(button);
  fireEvent.keyUp(button, { key: 'Escape' });
  fireEvent.click(button);
  for (let index = 0; index < frames.length; index++)
    act(() => frames[index]!(0));
  expect(list.style.height).toBe('0px');
  fireEvent.keyUp(button, { key: 'Enter' });
  fireEvent(window, new Event('resize'));
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(760);
  fireEvent(window, new Event('resize'));
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000);
  fireEvent(window, new Event('resize'));
  expect(list.style.height).toBe('');
  view.unmount();
});
it('renders anonymous and authenticated CMS controls and delegates their actions', () => {
  const navigate = vi.fn(),
    logout = vi.fn();
  const view = render(
    <Navbar {...navbarView} cms navigate={navigate} logout={logout} />,
  );
  fireEvent.click(screen.getByRole('link', { name: 'View Public Site' }));
  fireEvent.click(screen.getByRole('link', { name: 'Login' }));
  expect(navigate).toHaveBeenCalledWith('/');
  expect(navigate).toHaveBeenCalledWith('/login');
  view.rerender(
    <Navbar
      {...navbarView}
      cms
      authenticated
      navigate={navigate}
      logout={logout}
    />,
  );
  fireEvent.click(screen.getByRole('link', { name: 'Logout' }));
  expect(logout).toHaveBeenCalledOnce();
});
