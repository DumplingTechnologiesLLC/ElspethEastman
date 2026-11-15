import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../Login.presentational';
import { loginView } from '../../../stories/viewModels';
it('delegates credential changes and both submission paths', () => {
  const change = vi.fn(),
    login = vi.fn();
  const view = render(<Login {...loginView} change={change} login={login} />);
  fireEvent.change(view.container.querySelector('[name="username"]')!, {
    target: { value: 'Editor' },
  });
  fireEvent.change(view.container.querySelector('[name="password"]')!, {
    target: { value: 'Password' },
  });
  fireEvent.keyDown(view.container.querySelector('[name="username"]')!, {
    key: 'Enter',
  });
  fireEvent.keyDown(view.container.querySelector('[name="password"]')!, {
    key: 'Enter',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(change).toHaveBeenCalledWith('username', 'Editor');
  expect(change).toHaveBeenCalledWith('password', 'Password');
  expect(login).toHaveBeenCalledTimes(3);
});
