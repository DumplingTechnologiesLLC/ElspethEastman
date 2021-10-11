import ENDPOINTS from './endpoints';
import { responseFactory, requestOptionsFactory } from './utils';

export const deleteAffiliation = async (id) => {
  try {
    const response = await fetch(`${ENDPOINTS.affiliations.list}${id}/`, requestOptionsFactory('DELETE', true));
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const updateAffiliation = async (data, id) => {
  try {
    const response = await fetch(`${ENDPOINTS.affiliations.list}${id}/`, {
      ...requestOptionsFactory('PATCH', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const createAffiliation = async (data) => {
  try {
    const response = await fetch(`${ENDPOINTS.affiliations.list}`, {
      ...requestOptionsFactory('POST', true),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export const retrieveAffiliations = async () => {
  try {
    const response = await fetch(
      `${ENDPOINTS.affiliations.list}`,
    );
    return response.ok ? await responseFactory(response) : null;
  } catch (error) {
    return null;
  }
};
