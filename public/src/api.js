import ENDPOINTS from './endpoints';
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

import {
  retrieveFooterData,
} from './api/footer';

import { requestOptionsFactory, responseFactory } from './api/utils';

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
      const response = await fetch(this.endpoints.contactMe, {
        ...requestOptionsFactory('POST'),
        body: JSON.stringify(data),
      });
      return await responseFactory(response);
    } catch (error) {
      return {
        status: null,
        data: null,
      };
    }
  }

  retrieveFooterData = retrieveFooterData

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
