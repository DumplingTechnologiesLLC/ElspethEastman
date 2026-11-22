import type {
  ContentEditorState,
  EditorFieldKey,
  EditorTarget,
} from '../models/ContentEditor';
import type { Readable } from './Readable';
export interface ContentEditorController extends Readable<ContentEditorState> {
  open: (target: EditorTarget) => void;
  cancel: () => void;
  change: (key: EditorFieldKey, value: string) => void;
  addRow: () => void;
  changeRow: (key: string, field: 'label' | 'value', value: string) => void;
  removeRow: (key: string) => void;
  moveRow: (key: string, direction: -1 | 1) => void;
  upload: (file: File) => Promise<void>;
  removeImage: () => void;
  save: () => Promise<void>;
  confirmDelete: (confirm: boolean) => void;
  remove: () => Promise<void>;
}
