import * as stylex from '@stylexjs/stylex';
import type { Decorator } from '@storybook/react-vite';
import { tokens } from '../ui/tokens.stylex';
const css = stylex.create({
  surface: {
    padding: 24,
    minHeight: '100dvh',
    boxSizing: 'border-box',
    backgroundColor: tokens.canvas,
    color: tokens.foreground,
    fontFamily: tokens.sans,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
});
export const withSurface: Decorator = (Story) => (
  <div {...stylex.props(css.surface)}>
    <Story />
  </div>
);
