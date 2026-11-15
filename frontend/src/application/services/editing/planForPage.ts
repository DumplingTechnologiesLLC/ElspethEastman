import type { EditorTarget } from '../../../domain/models/ContentEditor';
import type { PageController } from '../../../domain/ports/PageController';
import type { EditorPlan } from './EditorPlan';
import { sharedPlan } from './sharedPlan';
export function planForPage(
  page: PageController,
  target: EditorTarget,
): EditorPlan | null {
  const content = page.getSnapshot().content;
  return content === null ? null : sharedPlan(content, page, target);
}
