class Endpoints {
  constructor() {
    this.baseEndpoints = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
      ? {
        skills: 'http://localhost:8000/api/skills',
        footerstats: 'http://localhost:8000/api/footerstats',
        projects: 'http://localhost:8000/api/projects',
        experience: 'http://localhost:8000/api/experience',
        contactMe: 'http://localhost:8000/api/contact-me',
      }
      : {
        skills: '/api/skills',
        footerstats: '/api/footerstats',
        projects: '/api/projects',
        experience: '/api/experience',
        contactMe: '/api/contact-me',
      };
  }

  endpoints() {
    return {
      skills: {
        list: `${this.baseEndpoints.skills}/`,
      },
      footersstats: {
        list: `${this.baseEndpoints.footerstats}/`,
      },
      projects: {
        paginated: `${this.baseEndpoints.projects}/paginated/`,
        list: `${this.baseEndpoints.projects}/list/`,
      },
      experience: {
        list: `${this.baseEndpoints.experience}/`,
      },
      contactMe: `${this.baseEndpoints.contactMe}/`,
    };
  }
}

const ENDPOINTS = new Endpoints().endpoints();
export default ENDPOINTS;
