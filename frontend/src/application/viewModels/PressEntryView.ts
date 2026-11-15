import type { WorkEntryView } from './WorkEntryView';
export interface PressEntryView extends WorkEntryView {
  readonly outlet: string;
  readonly category: string | null;
}
