import { flavors } from '@Components/ToastManager';
import {
  HTTP_NOT_FOUND, HTTP_BAD_SUBMISSION, HTTP_SUCCESS, HTTP_FORBIDDEN, REQUEST_FORBIDDEN_MESSAGE, REQUEST_FORBIDDEN_TITLE,
} from '@App/api/utils';

export const uuid = ((p = '') => {
  let counter = 0;
  /* eslint-disable no-plusplus */
  return (prefix) => `${prefix}${++counter}`;
})();

export const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

export const toastMapFactory = (notFoundMessage) => ({
  [HTTP_NOT_FOUND]: {
    flavor: flavors.error,
    title: 'Error',
    content: notFoundMessage,
  },
  [HTTP_BAD_SUBMISSION]: {
    flavor: flavors.error,
    title: 'Error',
    content: 'There was a problem with your submission',
  },
  [HTTP_FORBIDDEN]: {
    flavor: flavors.error,
    title: REQUEST_FORBIDDEN_TITLE,
    content: REQUEST_FORBIDDEN_MESSAGE,
  },
  [HTTP_SUCCESS]: {
    flavor: flavors.success,
    title: 'Success',
    content: 'Action submitted successfully.',
  },
});

export default uuid;
