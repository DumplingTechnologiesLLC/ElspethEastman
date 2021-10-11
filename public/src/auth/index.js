export const AUTH_TOKEN_KEY = 'ElspethEastmanAuthToken';
export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (value) => localStorage.setItem(AUTH_TOKEN_KEY, value);
export const deleteAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);
