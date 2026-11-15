import * as stylex from '@stylexjs/stylex';
import type { CopyBlockView } from '../../application/viewModels/PageElements';
import { CopyKind } from '../../domain/models/PageCopy';
import { Editable } from '../Editable/Editable.presentational';
import { tokens } from '../tokens.stylex';
const css = stylex.create({
  group: { display: 'flex', flexDirection: 'column', gap: 14 },
  headline: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 43.2, '@media (max-width: 760px)': 26.4 },
    lineHeight: 1.12,
    letterSpacing: '-.025em',
    margin: 0,
    whiteSpace: 'pre-line',
    color: tokens.foreground,
  },
  subheadline: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 21.6, '@media (max-width: 760px)': 20 },
    lineHeight: 1.45,
    color: tokens.copy,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  body: {
    maxWidth: 620,
    fontFamily: tokens.sans,
    fontSize: { default: 15.36, '@media (max-width: 760px)': 13.12 },
    lineHeight: 1.62,
    color: tokens.secondary,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  label: {
    fontWeight: 400,
    fontFamily: tokens.sans,
    fontSize: 10.24,
    lineHeight: 1.3,
    letterSpacing: '1.2px',
    color: tokens.secondary,
    textTransform: 'uppercase',
    margin: 0,
  },
});
const treatments = {
  [CopyKind.Headline]: css.headline,
  [CopyKind.Subheadline]: css.subheadline,
  [CopyKind.Body]: css.body,
  [CopyKind.SectionLabel]: css.label,
};
const elements = {
  [CopyKind.Headline]: 'h2',
  [CopyKind.Subheadline]: 'h3',
  [CopyKind.Body]: 'p',
  [CopyKind.SectionLabel]: 'h2',
} as const;
export function CopyBlocks({
  blocks,
}: {
  readonly blocks: readonly CopyBlockView[];
}) {
  return (
    <div {...stylex.props(css.group)}>
      {blocks.map((block) => {
        const Element = elements[block.kind];
        return (
          <Editable key={block.key} label="text block" actions={block.actions}>
            <Element {...stylex.props(treatments[block.kind])}>
              {block.text}
            </Element>
          </Editable>
        );
      })}
    </div>
  );
}
