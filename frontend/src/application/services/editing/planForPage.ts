import type { IdentifierSource } from '../../../domain/ports/IdentifierSource';
import type { EditorTarget } from '../../../domain/models/ContentEditor';
import type { PageController } from '../../../domain/ports/PageController';
import type { EditorPlan } from './EditorPlan';
import { sharedPlan } from './sharedPlan';
import { PageCollection } from '../../../domain/models/PageCollection';
import { entryPlan } from './entryPlan';
import { practicePlan, releasePlan } from './musicPlan';
import {
  appearancePlan,
  chapterPlan,
  clipPlan,
  currentPlan,
} from './pageCollectionPlans';
export function planForPage(
  page: PageController,
  target: EditorTarget,
  identifiers: IdentifierSource,
): EditorPlan | null {
  const content = page.getSnapshot().content;
  if (content === null) return null;
  switch (target.type) {
    case PageCollection.ContentEntries:
      return entryPlan(content, page, target.id);
    case PageCollection.Releases:
      return releasePlan(content, page, target.id);
    case PageCollection.StreamClips:
      return clipPlan(content, page, target.id);
    case PageCollection.Appearances:
      return appearancePlan(content, page, target.id);
    case PageCollection.BioChapters:
      return chapterPlan(content, page, target.id);
    case PageCollection.CurrentItems:
      return currentPlan(content, page, target.id);
    case 'practice':
      return practicePlan(content, page);
    default:
      return sharedPlan(content, page, target, identifiers);
  }
}
