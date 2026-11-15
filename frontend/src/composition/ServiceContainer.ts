import type { Notifications } from '../domain/ports/Notifications';
import type { Session } from '../domain/ports/Session';
import type { Contact } from '../domain/ports/Contact';
import type { ExperienceController } from '../domain/ports/ExperienceController';
import type { FooterController } from '../domain/ports/FooterController';
import type { ProjectsController } from '../domain/ports/ProjectsController';
import type { SkillsController } from '../domain/ports/SkillsController';
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
