import type { Preview } from '@storybook/react-vite';
import '../frontend/src/global.css';
const preview: Preview = {
  parameters: { controls: { expanded: true }, layout: 'padded' },
};
export default preview;
