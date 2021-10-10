import ENDPOINTS from './endpoints';
import { getCookie } from './utils';
import {
  createProject,
  retrieveProjects,
  retrievePaginatedProjects,
  updateAllProjects,
  updateProject,
  deleteProject,
} from './api/projects';

import {
  updateSkills,
  retrieveSkills,
} from './api/skills';

import {
  createExperience,
  retrieveExperience,
  updateExperience,
  deleteExperience,
} from './api/experience';

import {
  deleteAffiliation,
  updateAffiliation,
  createAffiliation,
  retrieveAffiliations,
} from './api/affiliation';

class API {
  constructor() {
    this.endpoints = ENDPOINTS;
  }

  /**
   * Skill API Calls
   */
  updateSkills = updateSkills

  retrieveSkills = retrieveSkills

  /**
   * Project API calls
   */
  retrieveProjects = retrieveProjects

  createProject = createProject

  updateAllProjects = updateAllProjects

  deleteProject = deleteProject

  updateProject = updateProject

  retrievePaginatedProjects = retrievePaginatedProjects

  async submitContactMe(data) {
    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch(this.endpoints.contactMe, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return {
        status: response.status,
        data: response.json(),
      };
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

  /**
   * Experience API calls
   */
  deleteExperience = deleteExperience

  createExperience = createExperience

  retrieveExperience = retrieveExperience

  updateExperience = updateExperience

  /**
   * Affiliation API calls
   */
  deleteAffiliation = deleteAffiliation

  updateAffiliation = updateAffiliation

  createAffiliation = createAffiliation

  retrieveAffiliations = retrieveAffiliations
}

const apiInstance = new API();

export default apiInstance;
