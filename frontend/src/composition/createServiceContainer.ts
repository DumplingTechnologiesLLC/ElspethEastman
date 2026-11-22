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
import { PageService } from '../application/services/PageService';
import { MediaService } from '../application/services/MediaService';
import { ContentEditorService } from '../application/services/ContentEditorService';
import { planForPage } from '../application/services/editing/planForPage';
import type { ContentEditorController } from '../domain/ports/ContentEditorController';
import type { PageId } from '../domain/models/Page';
import type { PageController } from '../domain/ports/PageController';
import type { ServiceContainer } from './ServiceContainer';
import type { ServiceDependencies } from './ServiceDependencies';
export function createServiceContainer({
  http,
  tokens,
  identifiers,
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
  const repository = new HttpContentRepository(http);
  const site = new SiteService(
    repository,
    session,
    notifications,
    new Date(clock.now()).getFullYear(),
  );
  const pages = new Map<PageId, PageController>();
  const editors = new Map<PageId, ContentEditorController>();
  const media = new MediaService(repository, notifications, session);
  const pageFor = (pageId: PageId): PageController => {
    let page = pages.get(pageId);
    if (page === undefined) {
      page = new PageService(pageId, repository, notifications, site, session);
      pages.set(pageId, page);
    }
    return page;
  };
  return {
    notifications,
    session,
    site,
    media,
    page: pageFor,
    editor: (pageId) => {
      let editor = editors.get(pageId);
      if (editor === undefined) {
        editor = new ContentEditorService(
          (target) => planForPage(pageFor(pageId), target, identifiers),
          media,
          notifications,
        );
        editors.set(pageId, editor);
      }
      return editor;
    },
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
