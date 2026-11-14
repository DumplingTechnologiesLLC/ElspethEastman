import type { Meta, StoryObj } from '@storybook/react-vite';
import { Projects } from './Projects.presentational';
import { projectsView } from '../../stories/viewModels';
const meta = {
  component: Projects,
  args: projectsView,
  tags: ['autodocs'],
} satisfies Meta<typeof Projects>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AllProjects: Story = { args: { mode: 'all' } };
export const Editor: Story = { args: { mode: 'editor', open: true } };
export const Empty: Story = { args: { projects: [] } };
