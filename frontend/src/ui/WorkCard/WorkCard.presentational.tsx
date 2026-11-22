import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import type { WorkEntryView } from '../../application/viewModels/WorkEntryView';
import { Editable } from '../Editable/Editable.presentational';
import { ActionLink } from '../Controls/Controls.presentational';
import { tokens } from '../tokens.stylex';
const css = stylex.create({
  card: {
    boxSizing: 'border-box',
    position: 'relative',
    height: 418.3,
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: tokens.line,
      ':focus-within': tokens.accent,
      ':hover': 'rgba(242,238,231,.32)',
    },
  },
  hero: { height: { default: 470, '@media (max-width: 760px)': 418.3 } },
  image: {
    minWidth: { default: 0, '@media (max-width: 760px)': 495.602 },
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    filter: 'grayscale(1)',
    transform: 'scale(1.033)',
    transition: {
      default: 'filter .49s ease-out, transform .49s ease-out',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  active: { filter: 'grayscale(0)', transform: 'scale(1.112)' },
  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage:
      'linear-gradient(180deg,rgba(4,4,4,.1) 0%,rgba(5,5,5,.18) 32%,rgba(6,6,6,.92) 84%,rgba(6,6,6,.98) 100%),linear-gradient(90deg,rgba(4,4,4,.25),transparent 62%)',
  },
  text: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    padding: 28,
    textAlign: 'left',
    pointerEvents: 'none',
  },
  eyebrow: {
    fontFamily: tokens.sans,
    fontSize: 9.6,
    letterSpacing: '1.536px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  title: {
    display: 'block',
    fontFamily: tokens.serif,
    fontSize: 41.472,
    lineHeight: 1,
    fontWeight: 400,
    letterSpacing: '-1.0368px',
    color: tokens.foreground,
    marginTop: 7,
    marginBottom: 0,
    overflowWrap: 'anywhere',
  },
  description: {
    display: 'block',
    fontFamily: tokens.sans,
    fontSize: 11.68,
    lineHeight: '17.053px',
    color: '#c1bbb3',
    marginTop: 10,
    marginBottom: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'clip',
  },
  open: {
    position: 'absolute',
    inset: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    outlineOffset: -4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: tokens.accent,
    backgroundColor: tokens.canvas,
    padding: 6,
    fontFamily: tokens.sans,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  action: { position: 'absolute', top: 16, right: 16 },
});
export function WorkCard({
  entry,
  onOpen,
  hero = false,
}: {
  readonly entry: WorkEntryView;
  readonly onOpen?: (button: HTMLButtonElement) => void;
  readonly hero?: boolean;
}) {
  const [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false);
  const active = hovered || focused;
  return (
    <Editable actions={entry.actions} label={entry.title} placement="inside">
      <article
        {...stylex.props(css.card, hero && css.hero)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        {entry.image !== null && (
          <img
            {...stylex.props(css.image, active && css.active)}
            src={entry.image.url}
            alt={entry.image.altText}
            loading={hero ? 'eager' : 'lazy'}
          />
        )}
        <div {...stylex.props(css.overlay)} />
        {onOpen === undefined ? (
          <>
            <div {...stylex.props(css.text)}>
              <p {...stylex.props(css.eyebrow)}>{entry.eyebrow}</p>
              <h2 {...stylex.props(css.title)}>{entry.title}</h2>
              <p {...stylex.props(css.description)}>{entry.description}</p>
            </div>
            {entry.action !== null && (
              <div {...stylex.props(css.action)}>
                <ActionLink
                  href={entry.action.href}
                  external={entry.action.isExternal}
                >
                  {entry.action.label}
                </ActionLink>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            {...stylex.props(css.open)}
            aria-label={`Open ${entry.title}`}
            data-entry-focus={entry.id + (hero ? '-hero' : '-card')}
            onClick={(event) => onOpen(event.currentTarget)}
          >
            <span {...stylex.props(css.text)}>
              <span {...stylex.props(css.eyebrow)}>{entry.eyebrow}</span>
              <span {...stylex.props(css.title)}>{entry.title}</span>
              <span {...stylex.props(css.description)}>
                {entry.description}
              </span>
            </span>
          </button>
        )}
        {entry.badge !== null && (
          <span {...stylex.props(css.badge)}>{entry.badge}</span>
        )}
      </article>
    </Editable>
  );
}
