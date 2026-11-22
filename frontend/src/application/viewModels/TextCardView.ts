import type { Link } from '../../domain/models/Link';
import type { EditableActions } from './EditableActions';
export interface TextCardView {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly action: Link | null;
  readonly badge: string | null;
  readonly actions: EditableActions | null;
}
