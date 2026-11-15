import type { Preview } from '@storybook/react-vite';
// oxlint-disable-next-line import/no-unassigned-import -- Gives isolated stories the application's global fonts and resets.
import '../frontend/src/global.css';
const preview: Preview = {
  parameters: { controls: { expanded: true }, layout: 'padded' },
};
export default preview;
