import ENDPOINTS from '@App/endpoints';
import { HTTP_SUCCESS, requestOptionsFactory, responseFactory } from './utils';

export const validateSession = async () => {
  try {
    const response = await fetch(ENDPOINTS.session.validate, {
      ...requestOptionsFactory('POST'),
      credentials: 'same-origin',
    });
    const { isAuthenticated } = await response.json();
    return isAuthenticated;
  } catch (err) {
    return false;
  }
};

export const login = async () => {
  try {
    const response = await fetch(ENDPOINTS.session.login, {
      ...requestOptionsFactory('POST'),
      credentials: 'same-origin',
    });
    return await responseFactory(response);
  } catch (err) {
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(ENDPOINTS.session.logout, {
      ...requestOptionsFactory('POST'),
      credentials: 'same-origin',
    });
    return response.status === HTTP_SUCCESS;
  } catch (err) {
    return null;
  }
};
