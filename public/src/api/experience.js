import ENDPOINTS from './endpoints';
import { responseFactory, requestOptionsFactory } from './utils';

export const deleteExperience = async (id) => {
  try {
    const response = await fetch(`${ENDPOINTS.experience.list}${id}/`, requestOptionsFactory('DELETE', true));
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const updateExperience = async (data, id) => {
  try {
    const response = await fetch(`${ENDPOINTS.experience.list}${id}/`, {
      ...requestOptionsFactory('PATCH', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const createExperience = async (data) => {
  try {
    const response = await fetch(`${ENDPOINTS.experience.list}`, {
      ...requestOptionsFactory('POST', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const retrieveExperience = async () => {
  try {
    const response = await fetch(`${ENDPOINTS.experience.list}`);
    return response.ok ? await responseFactory(response) : null;
  } catch (error) {
    return null;
  }
};
