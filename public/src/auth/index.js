export const AUTH_TOKEN_KEY = 'ElspethEastmanAuthToken';
export const getAuthToken = () => sessionStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (value) => sessionStorage.setItem(AUTH_TOKEN_KEY, value);
export const deleteAuthToken = () => sessionStorage.removeItem(AUTH_TOKEN_KEY);
