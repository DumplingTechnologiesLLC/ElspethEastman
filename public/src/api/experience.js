import { getCookie } from '../utils';
import ENDPOINTS from '../endpoints';
import { responseFactory } from './utils';

export const deleteExperience = async (id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.experience.list}${id}/`, {
      method: 'DELETE',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const updateExperience = async (data, id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.experience.list}${id}/`, {
      method: 'PATCH',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const createExperience = async (data) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.experience.list}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const retrieveExperience = async () => {
  try {
    const response = await fetch(
      `${ENDPOINTS.experience.list}`,
    );
    if (!response.ok) {
      return null;
    }
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};
