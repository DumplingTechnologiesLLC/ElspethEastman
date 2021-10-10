import { DEFAULT_ERROR_MESSAGE_TITLE, flavors } from '@Components/ToastManager';

export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
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

export const HTTP_NOT_FOUND = 404;
export const HTTP_BAD_SUBMISSION = 400;
export const HTTP_SUCCESS = 200;
export const HTTP_FORBIDDEN = 403;
export const HTTP_SERVER_ERROR = 500;
export const NULL_RESPONSE = { json: () => null, status: null };

export const HTTP_NETWORK_ERROR = null;
export const REQUEST_FORBIDDEN_TITLE = 'Forbidden';
export const REQUEST_FORBIDDEN_MESSAGE = 'Your session has expired. Please log in again.';

const NETWORK_ERROR_MESSAGE = 'Network error';
const NETWORK_ERROR_TITLE = 'Error';
/**
 * @function toastBasedOnResponse
 * @param {Response} response - Response from API
 * @param {Function} toast - Toast function
 * @param {Object} toastMap - Map of response codes to messages
 */
export const toastBasedOnResponse = (response, toast, toastMap) => {
  const { title, content, flavor } = toastMap[response.status] ?? {};
  if (title && content && flavor) {
    toast(
      title,
      content,
      flavor,
    );
  }
};

/**
 * @function performAPIAction
 * @param {Function} endpoint - The endpoint action to take
 * @param {*} payload - The payload for the request
 * @param {*} urlParams - The urlParams to include
 * @param {Function} toast - The toast function for toasting alerts
 */
export const performAPIAction = async (
  endpoint,
  payload,
  urlParams,
  toast,
) => {
  const response = await endpoint(payload, urlParams);
  if (response === null) {
    toast(
      NETWORK_ERROR_TITLE,
      NETWORK_ERROR_MESSAGE,
      flavors.error,
    );
    return responseFactory(NULL_RESPONSE);
  } if (response.status === HTTP_SERVER_ERROR) {
    toast(
      DEFAULT_ERROR_MESSAGE_TITLE,
      'There was a server error. Please try again later',
      flavors.error,
    );
    return responseFactory(NULL_RESPONSE);
  }

  if (response.status === HTTP_FORBIDDEN) {
    toast(
      REQUEST_FORBIDDEN_TITLE,
      REQUEST_FORBIDDEN_MESSAGE,
      flavors.error,
    );
  }
  return response;
};

/**
 * Deletes a selected item after prompting the user to confirm their choice
 * @function apiDelete
 * @param {Object} endpoint - The endpoint to DELETE to
 * @param {String} id - The id of the item to be deleted
 * @param {Function} toast - The toast function from the ToastContext
 */
export const performAPIDelete = async (endpoint, id, toast) => {
  /**
     * Disabled because I don't want to be implementing an entire alert modal for this one off project.
     * The basic JS alert is sufficient.
     */
  /* eslint-disable-next-line no-alert, no-restricted-globals */
  const confirmed = confirm('Are you sure you want to delete this item? This action cannot be undone.');
  if (confirmed) {
    return performAPIAction(endpoint, id, null, toast);
  }
  return false;
};

/**
 * Creates a response object that matches what the business logic expects
 * @function responseFactory
 * @param {Response} response
 * @returns {Object}
 */
export const responseFactory = async (response) => {
  const data = await response.json();
  return {
    status: response.status,
    data,
  };
};

/**
 *
 * @param {String} method what HTTP method to make
 * @returns
 */
export const requestOptionsFactory = (method) => {
  const csrftoken = getCookie('csrftoken');
  return {
    method,
    cache: 'no-cache',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json',
    },
  };
};
