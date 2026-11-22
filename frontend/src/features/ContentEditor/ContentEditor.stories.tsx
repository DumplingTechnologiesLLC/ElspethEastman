import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentEditor } from './ContentEditor.presentational';
import { EditorFieldKey as Key } from '../../domain/models/ContentEditor';
import streamImage from '../../assets/design/stream.png';
const noop = () => {};
export const editorView = {
  form: {
    title: 'Edit entry',
    canDelete: true,
    fields: [
      {
        key: Key.Title,
        label: 'Title',
        value: 'Collab @TheNormiesTV',
        kind: 'text' as const,
        required: true,
        options: [],
        error: '',
        disabled: false,
      },
      {
        key: Key.Description,
        label: 'Description',
        value: 'A little chaos. A lot of good company.',
        kind: 'textarea' as const,
        required: true,
        options: [],
        error: '',
        disabled: false,
      },
    ],
    image: { url: streamImage, required: true },
    rows: {
      title: 'Display metadata',
      canAdd: true,
      items: [
        {
          key: 'outlet',
          label: 'Outlet',
          value: 'The Normies',
          canRemove: false,
          canMoveUp: false,
          canMoveDown: true,
        },
        {
          key: 'detail-1',
          label: 'Format',
          value: 'Collaboration',
          canRemove: true,
          canMoveUp: true,
          canMoveDown: false,
        },
      ],
    },
  },
  saving: false,
  uploading: false,
  attributionLocked: false,
  confirmingDelete: false,
  errors: [],
  change: noop,
  cancel: noop,
  addRow: noop,
  changeRow: noop,
  removeRow: noop,
  moveRow: noop,
  upload: async () => {},
  removeImage: noop,
  save: async () => {},
  confirmDelete: noop,
  remove: async () => {},
} satisfies Parameters<typeof ContentEditor>[0];
const meta = {
  component: ContentEditor,
  args: editorView,
  tags: ['autodocs'],
} satisfies Meta<typeof ContentEditor>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Saving: StoryObj<typeof meta> = { args: { saving: true } };
export const Uploading: StoryObj<typeof meta> = { args: { uploading: true } };
export const Validation: StoryObj<typeof meta> = {
  args: { errors: ['Please check the highlighted fields.'] },
};
export const DeleteConfirmation: StoryObj<typeof meta> = {
  args: { confirmingDelete: true },
};
