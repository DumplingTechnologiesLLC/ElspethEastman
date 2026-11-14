import type {
  Clock,
  Http,
  Navigation,
  Notifications,
  Session,
  TokenStorage,
} from './contracts';
import { ApiService } from './ApiService';
import { ContactService, type Contact } from './ContactService';
import {
  ExperienceService,
  type ExperienceController,
} from './ExperienceService';
import { FooterService, type FooterController } from './FooterService';
import { NotificationService } from './NotificationService';
import { ProjectsService, type ProjectsController } from './ProjectsService';
import { SessionService } from './SessionService';
import { SkillsService, type SkillsController } from './SkillsService';
export interface ServiceContainer {
  readonly session: Session;
  readonly notifications: Notifications;
  readonly contact: Contact;
  skills: (editor: boolean) => SkillsController;
  projects: (mode: 'latest' | 'all' | 'editor') => ProjectsController;
  experience: () => ExperienceController;
  footer: () => FooterController;
  dispose: () => void;
}
export interface Dependencies {
  http: Http;
  tokens: TokenStorage;
  navigation: Navigation;
  clock: Clock;
  confirm: () => boolean;
}
/** One aggregate per browser root or SSR request; callers own its disposal. */
export function createServiceContainer({
  http,
  tokens,
  navigation,
  clock,
  confirm,
}: Dependencies): ServiceContainer {
  const notifications = new NotificationService(clock);
  const api = new ApiService(http, notifications);
  return {
    notifications,
    session: new SessionService(http, tokens, navigation, notifications, clock),
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
export const useSessionService = (services: ServiceContainer): Session =>
  services.session;
export const useNotificationService = (
  services: ServiceContainer,
): Notifications => services.notifications;
export const useContactService = (services: ServiceContainer): Contact =>
  services.contact;
export const useSkillsService = (services: ServiceContainer) => services.skills;
export const useProjectsService = (services: ServiceContainer) =>
  services.projects;
export const useExperienceService = (services: ServiceContainer) =>
  services.experience;
export const useFooterService = (services: ServiceContainer) => services.footer;
