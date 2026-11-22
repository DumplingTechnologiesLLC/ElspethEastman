import type { Link } from '../../domain/models/Link';
import type { CopyBlockView, IdentityView } from './PageElements';
import type { EditableActions } from './EditableActions';
export interface PageIntroView {
  readonly fallbackHeading: string | null;
  readonly blocks: readonly CopyBlockView[];
  readonly identities: readonly IdentityView[];
  readonly trivia: readonly {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly actions: EditableActions | null;
  }[];
  readonly action:
    (Link & { readonly icon: 'play' | 'jump' | 'stream' | 'external' }) | null;
  readonly controls: {
    readonly disabled: boolean;
    readonly settings: () => void;
    readonly addText: () => void;
    readonly addIdentity: () => void;
    readonly addFact: (() => void) | null;
  } | null;
}
