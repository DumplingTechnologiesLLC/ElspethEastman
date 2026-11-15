import type { CopyKind } from '../../domain/models/PageCopy';
import type { EditableActions } from './EditableActions';
export interface CopyBlockView {
  readonly key: string;
  readonly kind: CopyKind;
  readonly text: string;
  readonly actions: EditableActions | null;
}
export interface IdentityView {
  readonly id: number;
  readonly label: string;
  readonly actions: EditableActions | null;
}
export interface ImageView {
  readonly url: string;
  readonly altText: string;
  readonly caption: string;
  readonly actions: EditableActions | null;
}
