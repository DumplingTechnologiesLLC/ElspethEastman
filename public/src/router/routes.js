export const routes = {
  projects: '/projects',
  home: '/',
  cms: '/cms',
  // mail: '/cms/messages',
  logout: '/logout',
  login: '/login',
};

export const routesReverseLookup = Object.entries(routes).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});
export default routes;
