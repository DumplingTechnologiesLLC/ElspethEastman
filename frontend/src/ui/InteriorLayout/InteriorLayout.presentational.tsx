import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { tokens } from '../tokens.stylex';
const css = stylex.create({
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0,35fr) minmax(0,65fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    alignItems: 'start',
    minHeight: {
      default: 'calc(100dvh - 113px)',
      '@media (max-width: 760px)': 'calc(100dvh - 137px)',
    },
    flexGrow: 1,
    backgroundColor: tokens.canvas,
    color: tokens.foreground,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  intro: {
    position: { default: 'sticky', '@media (max-width: 760px)': 'relative' },
    top: 0,
    minWidth: 0,
  },
  selected: {
    display: { default: 'block', '@media (max-width: 760px)': 'none' },
  },
  body: {
    minWidth: 0,
    paddingBlockStart: { default: 39.84, '@media (max-width: 760px)': 24 },
    paddingBlockEnd: { default: 39.84, '@media (max-width: 760px)': 36 },
    paddingInline: {
      default: 'clamp(24px,3.36vw,58px)',
      '@media (max-width: 760px)': 20,
    },
  },
  detailBody: {
    paddingBlockStart: { default: 0, '@media (max-width: 760px)': 0 },
    paddingBlockEnd: { default: 0, '@media (max-width: 760px)': 0 },
    paddingInline: { default: 0, '@media (max-width: 760px)': 0 },
  },
});
export function InteriorLayout({
  intro,
  selected = false,
  children,
}: {
  readonly intro: ReactNode;
  readonly selected?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <div {...stylex.props(css.layout)}>
      <div {...stylex.props(css.intro, selected && css.selected)}>{intro}</div>
      <div {...stylex.props(css.body, selected && css.detailBody)}>
        {children}
      </div>
    </div>
  );
}
