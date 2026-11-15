import type { Link } from '../../domain/models/Link';
import type { ImageView } from './PageElements';
import type { EditableActions } from './EditableActions';
export interface WorkEntryView {
  readonly id: number;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly image: Pick<ImageView, 'url' | 'altText' | 'caption'> | null;
  readonly metadata: readonly {
    readonly key: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly action: Link | null;
  readonly publication: string | null;
  readonly badge: string | null;
  readonly actions: EditableActions | null;
}
