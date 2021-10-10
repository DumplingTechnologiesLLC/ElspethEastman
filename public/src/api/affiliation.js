import { getCookie } from '../utils';
import ENDPOINTS from '../endpoints';

export const deleteAffiliation = async (id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.affiliations.list}${id}/`, {
      method: 'DELETE',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
    });
    const returnData = await response.json();
    return {
      status: response.status,
      data: returnData,
    };
  } catch (error) {
    return null;
  }
};

export const updateAffiliation = async (data, id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.affiliations.list}${id}/`, {
      method: 'PATCH',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const returnData = await response.json();
    return {
      status: response.status,
      data: returnData,
    };
  } catch (error) {
    return null;
  }
};

export const createAffiliation = async (data) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.affiliations.list}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const returnData = await response.json();
    return {
      status: response.status,
      data: returnData,
    };
  } catch (error) {
    return null;
  }
};

export const retrieveAffiliations = async () => {
  try {
    const response = await fetch(
      `${ENDPOINTS.affiliations.list}`,
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};
