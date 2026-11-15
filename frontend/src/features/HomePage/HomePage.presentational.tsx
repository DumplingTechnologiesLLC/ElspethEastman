import * as stylex from '@stylexjs/stylex';
import { Fragment, type ReactNode } from 'react';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { Editable } from '../../ui/Editable/Editable.presentational';
import { Button, IconButton } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import editIcon from '../../assets/design/edit.svg';
import type { useHomePageState } from './useHomePageState';

const css = stylex.create({
  home: {
    flexGrow: 1,
    minHeight: {
      default: 'calc(100dvh - 113px)',
      '@media (max-width: 760px)': 1125,
    },
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0,1fr) minmax(0,1fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gridTemplateRows: {
      default: '130px 48px 1fr',
      '@media (max-width: 760px)': '400px 42px 1fr',
    },
    backgroundColor: tokens.canvas,
    color: tokens.foreground,
  },
  photo: {
    gridColumn: 1,
    gridRow: { default: '1 / 4', '@media (max-width: 760px)': 1 },
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    inset: 0,
    objectFit: 'cover',
    objectPosition: 'center',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(90deg, rgba(0,0,0,.24) 0%, rgba(0,0,0,.03) 58%, rgba(0,0,0,.1) 100%), linear-gradient(0deg, rgba(0,0,0,.48) 0%, rgba(0,0,0,.03) 46%)',
  },
  imageEdit: { position: 'absolute', top: 12, right: 12 },
  name: {
    gridColumn: { default: 2, '@media (max-width: 760px)': 1 },
    gridRow: 1,
    zIndex: 1,
    alignSelf: { default: 'start', '@media (max-width: 760px)': 'end' },
    paddingTop: { default: 41, '@media (max-width: 760px)': 0 },
    paddingInline: {
      default: 'clamp(24px, 3.125vw, 54px)',
      '@media (max-width: 760px)': 20,
    },
    paddingBottom: { default: 0, '@media (max-width: 760px)': 4 },
    margin: 0,
    fontFamily: tokens.serif,
    fontSize: {
      default: 'clamp(48px, 6vw, 103.68px)',
      '@media (max-width: 760px)': 'clamp(38px, 12vw, 70px)',
    },
    fontWeight: 400,
    lineHeight: 0.86,
    letterSpacing: '-.045em',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  accent: { color: '#c9c4bc', fontStyle: 'italic' },
  identity: {
    gridColumn: { default: 2, '@media (max-width: 760px)': 1 },
    gridRow: 2,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: { default: 12, '@media (max-width: 760px)': 8 },
    paddingInline: {
      default: 'clamp(24px, 3.47vw, 60px)',
      '@media (max-width: 760px)': 20,
    },
    backgroundColor: '#0c0c0c',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'rgba(255,255,255,.08)',
    fontFamily: tokens.sans,
    fontSize: { default: 10.88, '@media (max-width: 760px)': 8.96 },
    letterSpacing: '.15em',
    color: tokens.secondary,
    textTransform: 'uppercase',
  },
  rule: {
    width: 30,
    height: 1,
    backgroundColor: tokens.accent,
    marginRight: 4,
  },
  content: {
    gridColumn: { default: 2, '@media (max-width: 760px)': 1 },
    gridRow: 3,
    paddingTop: { default: 22, '@media (max-width: 760px)': 24 },
    paddingBottom: 34,
    paddingInline: {
      default: 'clamp(24px, 3.47vw, 60px)',
      '@media (max-width: 760px)': 20,
    },
    display: 'flex',
    flexDirection: 'column',
    gap: { default: 20, '@media (max-width: 760px)': 26 },
    backgroundImage:
      'radial-gradient(ellipse at 82% 10%, rgba(197,138,75,.035), transparent 32%)',
  },
  intro: { maxWidth: 670 },
  contact: {
    marginInlineStart: { default: -6, '@media (max-width: 760px)': 0 },
    marginInlineEnd: { default: -35, '@media (max-width: 760px)': 0 },
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    gridColumn: '1 / -1',
    alignSelf: 'start',
    padding: 12,
  },
});
export function HomePage({
  ready,
  error,
  retry,
  blocks,
  identities,
  image,
  controls,
  contact,
}: ReturnType<typeof useHomePageState> & { readonly contact: ReactNode }) {
  return (
    <PageBoundary ready={ready} error={error} retry={retry}>
      <section {...stylex.props(css.home)} aria-label="Introduction">
        <div {...stylex.props(css.photo)}>
          {image !== null && (
            <img
              {...stylex.props(css.image)}
              src={image.url}
              alt={image.altText}
              fetchPriority="high"
            />
          )}
          <div {...stylex.props(css.overlay)} />
          {image?.actions != null && (
            <div {...stylex.props(css.imageEdit)}>
              <IconButton
                aria-label="Edit hero image"
                disabled={image.actions.disabled}
                onClick={image.actions.edit}
              >
                <img src={editIcon} alt="" />
              </IconButton>
            </div>
          )}
        </div>
        <h1 {...stylex.props(css.name)}>
          Elspeth <em {...stylex.props(css.accent)}>Eastman</em>
        </h1>
        <div {...stylex.props(css.identity)}>
          <span {...stylex.props(css.rule)} aria-hidden="true" />
          {identities.map((identity, index) => (
            <Fragment key={identity.id}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <Editable label="identity label" actions={identity.actions}>
                <span>{identity.label}</span>
              </Editable>
            </Fragment>
          ))}
        </div>
        <div {...stylex.props(css.content)}>
          <div {...stylex.props(css.intro)}>
            <CopyBlocks blocks={blocks} />
          </div>
          <div {...stylex.props(css.contact)}>{contact}</div>
        </div>
        {controls !== null && (
          <div {...stylex.props(css.controls)}>
            <Button
              variant="secondary"
              disabled={controls.disabled}
              onClick={controls.settings}
            >
              Page settings
            </Button>
            <Button
              variant="secondary"
              disabled={controls.disabled}
              onClick={controls.addText}
            >
              Add text
            </Button>
            <Button
              variant="secondary"
              disabled={controls.disabled}
              onClick={controls.addIdentity}
            >
              Add identity label
            </Button>
          </div>
        )}
      </section>
    </PageBoundary>
  );
}
