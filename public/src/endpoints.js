class Endpoints {
  constructor() {
    this.baseEndpoints = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
      ? {
        projects: 'http://localhost:8000/api/projects',
        experience: 'http://localhost:8000/api/experience',
        contactMe: 'http://localhost:8000/api/contact-me',
      }
      : {
        projects: '/api/projects',
        experience: '/api/experience',
        contactMe: '/api/contact-me',
      };
  }

  endpoints() {
    return {
      projects: {
        list: `${this.baseEndpoints.projects}/`,
      },
      experience: {
        list: `${this.baseEndpoints.experience}/`,
      },
      contactMe: this.baseEndpoints.contactMe,
    };
  }
}

const ENDPOINTS = new Endpoints().endpoints();
export default ENDPOINTS;
