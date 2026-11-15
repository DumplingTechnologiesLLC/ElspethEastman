export interface EditableActions {
  readonly disabled: boolean;
  readonly edit: () => void;
  readonly remove: (() => void) | null;
  readonly order: EditableOrderActions | null;
  readonly feature: {
    readonly label: string;
    readonly apply: () => void;
  } | null;
}
export interface EditableOrderActions {
  readonly scope: string;
  readonly id: number;
  readonly up: (() => void) | null;
  readonly down: (() => void) | null;
  readonly before: (sourceId: number) => void;
}
