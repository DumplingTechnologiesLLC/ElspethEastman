import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import type { PressEntryView } from '../../application/viewModels/PressEntryView';
import { Editable } from '../Editable/Editable.presentational';
import { tokens } from '../tokens.stylex';
const css = stylex.create({
  card: {
    position: 'relative',
    minWidth: 0,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: tokens.line,
      ':focus-within': tokens.accent,
      ':hover': tokens.accentBorder,
    },
    overflow: 'hidden',
  },
  imageBox: {
    height: { default: 309.75, '@media (max-width: 760px)': 220 },
    overflow: 'hidden',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'grayscale(1)',
    transform: 'scale(1.015)',
    transition: {
      default: 'filter .49s ease-out,transform .49s ease-out',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  active: { filter: 'grayscale(0)', transform: 'scale(1.08)' },
  body: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '18px 20px 16px',
    minHeight: 122,
    pointerEvents: 'none',
  },
  eyebrow: {
    fontFamily: tokens.sans,
    fontSize: 8.96,
    letterSpacing: '1.34px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  title: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 29.6, '@media (max-width: 760px)': 26 },
    lineHeight: 1.08,
    color: tokens.foreground,
    margin: 0,
    overflowWrap: 'anywhere',
  },
  outlet: {
    fontFamily: tokens.sans,
    fontSize: 11.04,
    color: tokens.secondary,
    margin: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    fontFamily: tokens.sans,
    fontSize: 10.56,
    color: tokens.copy,
  },
  trigger: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    outlineOffset: -4,
  },
  heroImage: { height: { default: 418.32, '@media (max-width: 760px)': 300 } },
  heroBody: {
    position: { default: 'absolute', '@media (max-width: 760px)': 'relative' },
    bottom: 0,
    left: 0,
    right: 0,
    padding: { default: 38, '@media (max-width: 760px)': 20 },
    gap: 10,
  },
  heroTitle: {
    fontSize: { default: 64, '@media (max-width: 760px)': 32 },
    lineHeight: 0.98,
    letterSpacing: '-.035em',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: {
      default:
        'linear-gradient(180deg,rgba(5,5,5,.05),rgba(5,5,5,.12) 34%,rgba(5,5,5,.92) 86%,rgba(5,5,5,.98))',
      '@media (max-width: 760px)': 'none',
    },
  },
  description: {
    fontFamily: tokens.sans,
    fontSize: 12.16,
    lineHeight: 1.48,
    color: tokens.copy,
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
    backgroundColor: tokens.canvas,
    color: tokens.accent,
    fontFamily: tokens.sans,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});
export function CoverageCard({
  entry,
  featured = false,
  onOpen,
}: {
  readonly entry: PressEntryView;
  readonly featured?: boolean;
  readonly onOpen: (button: HTMLButtonElement) => void;
}) {
  const [active, setActive] = useState(false);
  return (
    <Editable label={entry.title} actions={entry.actions} placement="inside">
      <article
        {...stylex.props(css.card)}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setActive(false);
        }}
      >
        {entry.image !== null && (
          <div {...stylex.props(css.imageBox, featured && css.heroImage)}>
            <img
              {...stylex.props(css.image, active && css.active)}
              src={entry.image.url}
              alt={entry.image.altText}
              loading={featured ? 'eager' : 'lazy'}
            />
          </div>
        )}
        {featured && <div {...stylex.props(css.scrim)} />}
        <div {...stylex.props(css.body, featured && css.heroBody)}>
          <p {...stylex.props(css.eyebrow)}>{entry.eyebrow}</p>
          <h2 {...stylex.props(css.title, featured && css.heroTitle)}>
            {entry.title}
          </h2>
          {featured ? (
            <p {...stylex.props(css.description)}>{entry.description}</p>
          ) : (
            <>
              <p {...stylex.props(css.outlet)}>{entry.outlet}</p>
              <div {...stylex.props(css.footer)}>
                <span>{entry.category}</span>
                <span>{entry.action?.label ?? 'Read'}</span>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          {...stylex.props(css.trigger)}
          aria-label={`Open ${entry.title}`}
          data-entry-focus={entry.id + (featured ? '-hero' : '-card')}
          onClick={(event) => onOpen(event.currentTarget)}
        />
        {entry.badge !== null && (
          <span {...stylex.props(css.badge)}>{entry.badge}</span>
        )}
      </article>
    </Editable>
  );
}
