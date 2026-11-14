import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { AuthContext } from '@App/Auth';
import PrivateRoute from './PrivateRoute';

describe('CMS route access', () => {
  const renderCMS = (isAuthenticated) => render(
    <MemoryRouter initialEntries={['/cms']}>
      <AuthContext.Provider value={{ isAuthenticated }}>
        <Switch>
          <PrivateRoute path="/cms"><p>CMS editor</p></PrivateRoute>
          <Route path="/login"><p>Sign in</p></Route>
        </Switch>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  test('anonymous visitors reach login', () => {
    renderCMS(false);
    expect(screen.getByText('Sign in')).toBeTruthy();
    expect(screen.queryByText('CMS editor')).toBeNull();
  });
  test('authenticated editors reach the CMS', () => {
    renderCMS(true);
    expect(screen.getByText('CMS editor')).toBeTruthy();
  });
});
