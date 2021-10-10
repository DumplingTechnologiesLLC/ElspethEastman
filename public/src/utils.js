import { flavors } from '@Components/ToastManager';
import { NOT_FOUND, BAD_SUBMISSION, SUCCESS } from '@App/api/utils';

export const uuid = ((p = '') => {
  let counter = 0;
  /* eslint-disable no-plusplus */
  return (prefix) => `${prefix}${++counter}`;
})();

export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

export const toastMapFactory = (notFoundMessage) => ({
  [NOT_FOUND]: {
    flavor: flavors.error,
    title: 'Error',
    content: notFoundMessage,
  },
  [BAD_SUBMISSION]: {
    flavor: flavors.error,
    title: 'Error',
    content: 'There was a problem with your submission',
  },
  [SUCCESS]: {
    flavor: flavors.success,
    title: 'Success',
    content: 'Action submitted successfully.',
  },
});

export default uuid;
