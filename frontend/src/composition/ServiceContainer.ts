import type { Notifications } from '../domain/ports/Notifications';
import type { Session } from '../domain/ports/Session';
import type { Contact } from '../domain/ports/Contact';
import type { SiteController } from '../domain/ports/SiteController';
import type { PageController } from '../domain/ports/PageController';
import type { PageId } from '../domain/models/Page';
import type { MediaController } from '../domain/ports/MediaController';
import type { ContentEditorController } from '../domain/ports/ContentEditorController';
export interface ServiceContainer {
  readonly session: Session;
  readonly notifications: Notifications;
  readonly contact: Contact;
  readonly site: SiteController;
  readonly media: MediaController;
  page: (pageId: PageId) => PageController;
  editor: (pageId: PageId) => ContentEditorController;
  dispose: () => void;
}
