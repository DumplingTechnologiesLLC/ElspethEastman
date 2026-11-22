import type { Meta, StoryObj } from '@storybook/react-vite';
import { Editable } from './Editable.presentational';
import { withSurface } from '../../stories/withSurface';
import type { EditableActions } from '../../application/viewModels/EditableActions';
const noop = () => {};
export const editableView: EditableActions = {
  disabled: false,
  edit: noop,
  remove: noop,
  order: {
    scope: '1/eyebrows/null',
    id: '00000000-0000-4000-8000-000000000001',
    up: noop,
    down: noop,
    before: noop,
  },
  feature: { label: 'Feature', apply: noop },
};
const meta = {
  component: Editable,
  decorators: [withSurface],
  excludeStories: /.*View$/,
  args: {
    actions: editableView,
    label: 'identity label',
    children: 'Voice actor',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Editable>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Public: StoryObj<typeof meta> = { args: { actions: null } };
