import ENDPOINTS from '@App/endpoints';
import { requestOptionsFactory, responseFactory } from './utils';

export const submitContactMe = async (data) => {
  try {
    const response = await fetch(ENDPOINTS.contactMe, {
      ...requestOptionsFactory('POST'),
      body: JSON.stringify(data),
    });
    return await responseFactory(response);
  } catch (error) {
    return null;
  }
};

export default submitContactMe;
