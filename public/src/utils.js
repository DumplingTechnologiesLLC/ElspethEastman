export const uuid = ((p = '') => {
  let counter = 0;
  /* eslint-disable no-plusplus */
  return (prefix) => `${prefix}${++counter}`;
})();

export default uuid;
