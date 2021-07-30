import { getCookie } from '../utils';
import ENDPOINTS from '../endpoints';

export const updateSkills = async (data) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(ENDPOINTS.skills.list, {
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

export const retrieveSkills = async () => {
  try {
    const response = await fetch(
      `${ENDPOINTS.skills.list}`,
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};
