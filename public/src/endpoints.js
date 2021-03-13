const ENDPOINTS = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  ? {
    projects: {
      list: 'localhost:8000/api/projects/list',
    },
    contactMe: 'localhost:8000/api/contact-me',
  }
  : {
    contactMe: '/api/contact-me',
    projects: {
      list: '/api/projects/list',
    },
  };
export default ENDPOINTS;
