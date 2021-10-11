import ENDPOINTS from '@App/api/endpoints';
import { responseFactory } from './utils';

export const retrieveFooterData = async () => {
  try {
    const response = await fetch(`${ENDPOINTS.footersstats.list}`);
    return response.ok ? await responseFactory(response) : null;
  } catch (error) {
    return null;
  }
};

export default retrieveFooterData;
