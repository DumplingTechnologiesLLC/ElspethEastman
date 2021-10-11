import ENDPOINTS from './endpoints';
import { requestOptionsFactory, responseFactory } from './utils';

export const updateSkills = async (data) => {
  try {
    const response = await fetch(ENDPOINTS.skills.list, {
      ...requestOptionsFactory('PATCH'),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const retrieveSkills = async () => {
  try {
    const response = await fetch(`${ENDPOINTS.skills.list}`);
    return response.ok ? await responseFactory(response) : null;
  } catch (error) {
    return null;
  }
};
