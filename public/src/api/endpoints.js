class Endpoints {
  constructor() {
    this.baseEndpoints = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
      ? {
        skills: 'http://localhost:8000/api/skills',
        affiliations: 'http://localhost:8000/api/affiliations',
        footerstats: 'http://localhost:8000/api/footerstats',
        projects: 'http://localhost:8000/api/projects',
        experience: 'http://localhost:8000/api/experience',
        contactMe: 'http://localhost:8000/api/contact-me',
        session: 'http://localhost:8000/api/session',
      }
      : {
        skills: '/api/skills',
        footerstats: '/api/footerstats',
        affiliations: '/api/affiliations',
        projects: '/api/projects',
        experience: '/api/experience',
        contactMe: '/api/contact-me',
        session: '/api/session',
      };
  }

  endpoints() {
    return {
      session: {
        validate: `${this.baseEndpoints.session}/`,
        login: `${this.baseEndpoints.session}/login/`,
        logout: `${this.baseEndpoints.session}/logout/`,
      },
      skills: {
        list: `${this.baseEndpoints.skills}/`,
      },
      affiliations: {
        list: `${this.baseEndpoints.affiliations}/`,
      },
      footersstats: {
        list: `${this.baseEndpoints.footerstats}/`,
      },
      projects: {
        paginated: `${this.baseEndpoints.projects}/paginated/`,
        list: `${this.baseEndpoints.projects}/list/`,
        update: `${this.baseEndpoints.projects}/`,
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
