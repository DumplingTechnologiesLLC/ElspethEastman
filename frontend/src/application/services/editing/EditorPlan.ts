import type { ContentDraft } from '../../../domain/models/ContentEditor';
import type { ContentResult } from '../../../domain/models/ContentResult';
export interface EditorPlan {
  readonly draft: ContentDraft;
  readonly save: (draft: ContentDraft) => Promise<ContentResult<unknown>>;
  readonly remove?: () => Promise<ContentResult<void>>;
}
