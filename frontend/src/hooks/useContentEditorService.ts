import { useState } from 'react';
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
  const [editor] = useState(() => services.editor(pageId));
  return editor;
}
