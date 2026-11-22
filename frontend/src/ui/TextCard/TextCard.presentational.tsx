import * as stylex from '@stylexjs/stylex';
import type { TextCardView } from '../../application/viewModels/TextCardView';
import { Editable } from '../Editable/Editable.presentational';
import { tokens } from '../tokens.stylex';
import external from '../../assets/design/external-small.svg';
const css = stylex.create({
  card: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 18,
    minWidth: 0,
    minHeight: { default: 220, '@media (max-width: 760px)': 190 },
    padding: { default: 22, '@media (max-width: 760px)': 18 },
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: tokens.line,
      ':hover': tokens.accentBorder,
      ':focus-within': tokens.accentBorder,
    },
  },
  compact: { minHeight: 130, padding: '19px 20px' },
  heading: { display: 'flex', flexDirection: 'column', gap: 8 },
  eyebrow: {
    fontFamily: tokens.sans,
    fontSize: 9.28,
    letterSpacing: '1.48px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  title: {
    fontFamily: tokens.serif,
    fontSize: { default: 36.8, '@media (max-width: 760px)': 28 },
    lineHeight: 1.05,
    letterSpacing: '-.025em',
    fontWeight: 400,
    color: tokens.foreground,
    margin: 0,
    overflowWrap: 'anywhere',
  },
  compactTitle: { fontSize: 24.8, lineHeight: 1.15 },
  description: {
    fontFamily: tokens.sans,
    fontSize: 13,
    lineHeight: 1.6,
    color: tokens.secondary,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
    fontFamily: tokens.sans,
    fontSize: 10.4,
    color: tokens.secondary,
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: { default: tokens.copy, ':hover': tokens.accent },
    textDecoration: 'none',
  },
  badge: {
    fontFamily: tokens.sans,
    fontSize: 9,
    letterSpacing: '1px',
    color: tokens.accent,
    textTransform: 'uppercase',
  },
});
export function TextCard({
  entry,
  compact = false,
}: {
  readonly entry: TextCardView;
  readonly compact?: boolean;
}) {
  return (
    <Editable label={entry.title} actions={entry.actions} placement="inside">
      <article {...stylex.props(css.card, compact && css.compact)}>
        <div {...stylex.props(css.heading)}>
          <p {...stylex.props(css.eyebrow)}>{entry.eyebrow}</p>
          <h3 {...stylex.props(css.title, compact && css.compactTitle)}>
            {entry.title}
          </h3>
          {entry.description !== null && (
            <p {...stylex.props(css.description)}>{entry.description}</p>
          )}
          {entry.badge !== null && (
            <span {...stylex.props(css.badge)}>{entry.badge}</span>
          )}
        </div>
        <div {...stylex.props(css.footer)}>
          {entry.category !== null && <span>{entry.category}</span>}
          {entry.action !== null && (
            <a
              {...stylex.props(css.link)}
              href={entry.action.href}
              target={entry.action.isExternal ? '_blank' : undefined}
              rel={entry.action.isExternal ? 'noopener noreferrer' : undefined}
            >
              {entry.action.label}
              {entry.action.isExternal && <img src={external} alt="" />}
            </a>
          )}
        </div>
      </article>
    </Editable>
  );
}
