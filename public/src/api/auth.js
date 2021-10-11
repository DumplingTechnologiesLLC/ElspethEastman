import ENDPOINTS from '@App/api/endpoints';
import { HTTP_SUCCESS, requestOptionsFactory, responseFactory } from './utils';

export const validateSession = async () => {
  try {
    const response = await fetch(ENDPOINTS.session.validate, {
      ...requestOptionsFactory('POST', true),
    });
    const { isAuthenticated } = await response.json();
    return isAuthenticated;
  } catch (err) {
    return false;
  }
};

export const login = async (data) => {
  try {
    const response = await fetch(ENDPOINTS.session.login, {
      ...requestOptionsFactory('POST', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (err) {
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(ENDPOINTS.session.logout, {
      ...requestOptionsFactory('POST', true),
    });
    return response.status === HTTP_SUCCESS;
  } catch (err) {
    return null;
  }
};
