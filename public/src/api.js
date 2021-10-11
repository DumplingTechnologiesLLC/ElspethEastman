import ENDPOINTS from './api/endpoints';
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

import submitContactMe from './api/contact';
import { login, logout, validateSession } from './api/auth';

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

  /**
   * Contact me calls
   */

  submitContactMe = submitContactMe

  /**
   * Footer calls
   */

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

  /**
   * Authentication API calls
   */
  login = login

  logout = logout

  validateSession = validateSession
}

const apiInstance = new API();

export default apiInstance;
