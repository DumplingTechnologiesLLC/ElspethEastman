import { flavors } from '@Components/ToastManager';

export const NOT_FOUND = 404;
export const BAD_SUBMISSION = 400;
export const SUCCESS = 200;

/**
 * @function toastBasedOnResponse
 * @param {Response} response - Response from API
 * @param {Function} toast - Toast function
 * @param {Object} toastMap - Map of response codes to messages
 */
export const toastBasedOnResponse = (response, toast, toastMap) => {
  const { title, content, flavor } = toastMap[response.status];
  toast(
    title,
    content,
    flavor,
  );
};

/**
 * @function performAPIAction
 * @param {Function} endpoint - The endpoint action to take
 * @param {*} payload - The payload for the request
 * @param {*} urlParams - The urlParams to include
 * @param {Function} toast - The toast function for toasting alerts
 * @param {Object} toastMap - The map of error response codes to error messages to toast
 * @param {Function} successCallback - The success callback function. Accepts response object as argument
 * @param {Function} errorCallback - The error callback function. Accepts response object as argument
 */
export const performAPIAction = async (
  endpoint,
  payload,
  urlParams,
  toast,
  toastMap,
  successCallback = () => {},
  errorCallback = (response) => {
    toastBasedOnResponse(response, toast, toastMap);
  },
) => {
  const response = await endpoint(payload, urlParams);
  if (response === null) {
    toast(
      'Error',
      'Network error',
      flavors.error,
    );
    return;
  }
  if (response.status === SUCCESS) {
    successCallback(response);
  } else {
    errorCallback(response);
  }
};

/**
 * Deletes a selected item after prompting the user to confirm their choice
 * @function apiDelete
 * @param {Object} endpoint - The endpoint to DELETE to
 * @param {String} id - The id of the item to be deleted
 * @param {Function} toast - The toast function from the ToastContext
 * @param {Object} toastMap - The map of error response codes to error messages to toast
 * @param {Function} successCallback - an action to take upon success of the deletion
 */
export const performAPIDelete = async (endpoint, id, toast, toastMap, successCallback = () => {}) => {
  /**
     * Disabled because I don't want to be implementing an entire alert modal for this one off project.
     * The basic JS alert is sufficient.
     */
  /* eslint-disable-next-line no-alert, no-restricted-globals */
  const confirmed = confirm('Are you sure you want to delete this item? This action cannot be undone.');
  if (confirmed) {
    performAPIAction(endpoint, id, null, toast, toastMap, successCallback);
  }
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
