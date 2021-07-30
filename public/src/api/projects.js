import { getCookie } from '../utils';
import ENDPOINTS from '../endpoints';

export const retrieveProjects = async () => {
  try {
    const response = await fetch(
      `${ENDPOINTS.projects.list}`,
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};

export const createProject = async (data) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.projects.list}`, {
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

export const updateAllProjects = async (data) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.projects.list}batch_update/`, {
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

export const deleteProject = async (id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.projects.list}${id}/`, {
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

export const updateProject = async (data, id) => {
  try {
    const csrftoken = getCookie('csrftoken');
    const response = await fetch(`${ENDPOINTS.projects.list}${id}/`, {
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

export const retrievePaginatedProjects = async (page) => {
  try {
    const response = await fetch(
      `${ENDPOINTS.projects.paginated}?page=${page}`,
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};
