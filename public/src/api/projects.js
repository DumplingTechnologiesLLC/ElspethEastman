import ENDPOINTS from './endpoints';
import { requestOptionsFactory, responseFactory } from './utils';

export const retrieveProjects = async () => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.list}`);
    if (!response.ok) {
      return null;
    }
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const createProject = async (data) => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.list}`, {
      ...requestOptionsFactory('POST', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const updateAllProjects = async (data) => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.list}batch_update/`, {
      ...requestOptionsFactory('PATCH', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.list}${id}/`, requestOptionsFactory('DELETE', true));
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const updateProject = async (data, id) => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.list}${id}/`, {
      ...requestOptionsFactory('PATCH', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const retrievePaginatedProjects = async (page) => {
  try {
    const response = await fetch(`${ENDPOINTS.projects.paginated}?page=${page}`);
    return response.ok ? await responseFactory(response) : null;
  } catch (error) {
    return null;
  }
};
