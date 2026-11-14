import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from './Navbar.presentational';
import { navbarView } from '../../stories/viewModels';
const meta = {
  component: Navbar,
  args: navbarView,
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CMS: Story = { args: { cms: true, authenticated: true } };
