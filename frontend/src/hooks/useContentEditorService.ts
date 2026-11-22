import type { ServiceContainer } from '../composition/ServiceContainer';
import type { PageId } from '../domain/models/Page';
import type { ContentEditorController } from '../domain/ports/ContentEditorController';
export function useContentEditorService({
  services,
  pageId,
}: {
  services: ServiceContainer;
  pageId: PageId;
}): ContentEditorController {
  return services.editor(pageId);
}
