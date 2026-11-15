import { ApiService } from '../application/services/ApiService';
import { ContactService } from '../application/services/ContactService';
import { ExperienceService } from '../application/services/ExperienceService';
import { FooterService } from '../application/services/FooterService';
import { UIAlertService } from '../application/services/UIAlertService';
import { ProjectsService } from '../application/services/ProjectsService';
import { SessionService } from '../application/services/SessionService';
import { SkillsService } from '../application/services/SkillsService';
import { SiteService } from '../application/services/SiteService';
import { HttpContentRepository } from '../platform/HttpContentRepository';
import type { ServiceContainer } from './ServiceContainer';
import type { ServiceDependencies } from './ServiceDependencies';
export function createServiceContainer({
  http,
  tokens,
  navigation,
  clock,
  confirm,
}: ServiceDependencies): ServiceContainer {
  const notifications = new UIAlertService(clock);
  const api = new ApiService(http, notifications);
  const session = new SessionService(
    http,
    tokens,
    navigation,
    notifications,
    clock,
  );
  return {
    notifications,
    session,
    site: new SiteService(
      new HttpContentRepository(http),
      session,
      notifications,
    ),
    contact: new ContactService(api, notifications),
    skills: (editor) => new SkillsService(api, notifications, editor),
    projects: (mode) => new ProjectsService(api, notifications, confirm, mode),
    experience: () =>
      new ExperienceService(
        api,
        notifications,
        confirm,
        new Date(clock.now()).getFullYear(),
      ),
    footer: () => new FooterService(api, notifications, confirm),
    dispose: () => notifications.dispose(),
  };
}
