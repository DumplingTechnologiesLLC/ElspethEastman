const ENDPOINTS = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? {
  projects: 'localhost:8000/projects/list',
} : {
  projects: {
    list: '/projects/list',
  },
};
export default ENDPOINTS;
