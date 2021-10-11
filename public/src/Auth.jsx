import { ToastContext, DEFAULT_ERROR_MESSAGE_TITLE } from '@Components/ToastManager';
import {
  useContext, useEffect, useState, createContext,
} from 'react';
import API from '@App/api';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  AUTH_TOKEN_KEY,
  getAuthToken,
  setAuthToken,
  deleteAuthToken,
} from '@App/auth/index';
import { performAPIAction } from './api/utils';

import routes from './router/routes';

export const AuthContext = createContext();

const Auth = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const { toast, flavors } = useContext(ToastContext);
  const localStorateToken = getAuthToken();
  const [token, setToken] = useState(localStorateToken);

  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const goToLoginPage = () => {
    history.push(routes.login);
  };

  const handleSuccessfulLogin = (value) => {
    setIsAuthenticated(!!value);
    setAuthToken(value);
    setToken(value);
    history.push(routes.cms);
  };

  const logout = async () => {
    const success = await performAPIAction(API.logout, null, null, toast);
    if (success) {
      toast(
        'Goodbye!',
        'Successfully logged off',
        flavors.success,
      );
      setIsAuthenticated(false);
      deleteAuthToken();
      goToLoginPage();
    } else {
      toast(
        DEFAULT_ERROR_MESSAGE_TITLE,
        'We couldn\'t log you off properly. Please try again later',
        flavors.error,
      );
    }
  };

  const validateSession = async () => {
    const sessionValidity = await performAPIAction(API.validateSession, getAuthToken(), null, toast);
    const oldSessionIsValid = isAuthenticated;
    setIsAuthenticated(sessionValidity);
    if (oldSessionIsValid !== sessionValidity && oldSessionIsValid) {
      toast(
        'Session has expired',
        'Please re-log in.',
        flavors.error,
      );
      deleteAuthToken();
      goToLoginPage();
    }
  };

  useEffect(() => {
    const updateOnStorageChange = () => {
      if (token !== getAuthToken()) {
        setAuthToken(localStorage.getItem(AUTH_TOKEN_KEY));
        validateSession();
      }
    };
    window.addEventListener('storage', updateOnStorageChange);
    return () => {
      window.removeEventListener('storage', updateOnStorageChange);
    };
    /**
     * We don't want to rerender when validateSession reference changes
     */
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [token]);

  useEffect(() => {
    validateSession();
  /**
   * We don't want to have this retrigger when validateSession reference changes.
   */
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.pathname, token]);

  return (
    <AuthContext.Provider value={{
      handleSuccessfulLogin,
      logout,
      validateSession,
      token,
      isAuthenticated,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

Auth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Auth;
