import ENDPOINTS from './endpoints';

class API {
  constructor() {
    this.endpoints = ENDPOINTS;
  }

  async retrieveSkills() {
    try {
      const response = await fetch(
        `${this.endpoints.skills.list}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  /* eslint-disable class-methods-use-this */
  async retrieveProjects() {
    try {
      const response = await fetch(
        `${this.endpoints.projects.list}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  /* eslint-disable class-methods-use-this */
  async retrievePaginatedProjects(page) {
    try {
      const response = await fetch(
        `${this.endpoints.projects.paginated}?page=${page}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  async submitContactMe(data) {
    try {
      const response = await fetch(this.endpoints.contactMe, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      return null;
    }
  }

  async retrieveFooterData() {
    try {
      const response = await fetch(
        `${this.endpoints.footersstats.list}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }

  async retrieveExperience() {
    try {
      const response = await fetch(
        `${this.endpoints.experience.list}`,
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      return null;
    }
  }
}

const apiInstance = new API();

export default apiInstance;
