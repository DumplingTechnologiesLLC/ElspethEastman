import * as stylex from '@stylexjs/stylex';
import { Fragment } from 'react';
import type { PageIntroView } from '../../application/viewModels/PageIntroView';
import { CopyKind } from '../../domain/models/PageCopy';
import { Editable } from '../Editable/Editable.presentational';
import { ActionLink, Button } from '../Controls/Controls.presentational';
import { tokens } from '../tokens.stylex';
import playIcon from '../../assets/design/play.svg';
import jumpIcon from '../../assets/design/jump.svg';
import streamIcon from '../../assets/design/stream-icon.svg';
import externalIcon from '../../assets/design/external.svg';

const css = stylex.create({
  fill: { height: { default: '100%', '@media (max-width: 760px)': 'auto' } },
  intro: {
    boxSizing: 'border-box',
    minHeight: {
      default: 'min(926px,calc(100dvh - 113px))',
      '@media (max-width: 760px)': 'auto',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 30,
    paddingTop: { default: 49.8, '@media (max-width: 760px)': 38 },
    paddingBottom: { default: 49.8, '@media (max-width: 760px)': 36 },
    paddingInline: {
      default: 'clamp(24px,3.7vw,64px)',
      '@media (max-width: 760px)': 20,
    },
    borderRightWidth: { default: 1, '@media (max-width: 760px)': 0 },
    borderRightStyle: 'solid',
    borderRightColor: tokens.line,
    borderBottomWidth: { default: 0, '@media (max-width: 760px)': 1 },
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    backgroundImage:
      'radial-gradient(ellipse at 40% 16%, rgba(197,138,75,.08), transparent 52%)',
  },
  identities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    color: tokens.accent,
    textTransform: 'uppercase',
    fontFamily: tokens.sans,
    fontSize: 10.88,
    letterSpacing: '2.0672px',
    lineHeight: 1.3,
    marginBottom: { default: 16, '@media (max-width: 760px)': 14 },
  },
  copy: { display: 'flex', flexDirection: 'column', gap: 14 },
  heading: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: {
      default: 'clamp(48px,6.2vw,107.136px)',
      '@media (max-width: 760px)': 67,
    },
    lineHeight: { default: 0.82, '@media (max-width: 760px)': '61px' },
    letterSpacing: {
      default: '-.055em',
      '@media (max-width: 760px)': '-3.3px',
    },
    color: tokens.foreground,
    margin: 0,
    paddingTop: 0,
    marginBottom: { default: 16, '@media (max-width: 760px)': 0 },
    whiteSpace: 'pre-line',
    overflowWrap: 'anywhere',
  },
  accent: {
    color: '#c9c4bc',
    fontStyle: { default: 'italic', '@media (max-width: 760px)': 'normal' },
  },
  sub: {
    fontFamily: tokens.serif,
    fontSize: { default: 21.6, '@media (max-width: 760px)': 22 },
    lineHeight: { default: 1.45, '@media (max-width: 760px)': '31px' },
    fontWeight: 400,
    color: tokens.copy,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  body: {
    fontFamily: tokens.sans,
    fontSize: { default: 14.4, '@media (max-width: 760px)': 13.2 },
    lineHeight: { default: 1.62, '@media (max-width: 760px)': '21px' },
    color: tokens.secondary,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  label: {
    fontFamily: tokens.sans,
    fontSize: 11,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: tokens.secondary,
    margin: 0,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: 10, '@media (max-width: 760px)': 14 },
  },
  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(80px,1fr))',
    gap: 18,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 13,
  },
  fact: { margin: 0 },
  factLabel: {
    fontFamily: tokens.sans,
    fontSize: 7.8,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: tokens.secondary,
    marginBottom: 6,
  },
  factValue: {
    fontFamily: tokens.sans,
    fontSize: 10.2,
    lineHeight: '14px',
    color: tokens.foreground,
    margin: 0,
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 },
});
const icons = {
  play: playIcon,
  jump: jumpIcon,
  stream: streamIcon,
  external: externalIcon,
};
const bodyStyles = {
  [CopyKind.Headline]: css.heading,
  [CopyKind.Subheadline]: css.sub,
  [CopyKind.Body]: css.body,
  [CopyKind.SectionLabel]: css.label,
};
function Title({
  text,
  primary,
}: {
  readonly text: string;
  readonly primary: boolean;
}) {
  const Element = primary ? 'h1' : 'h2';
  return (
    <Element {...stylex.props(css.heading)}>
      {text === 'Voiceover' ? (
        <>
          Voice<em {...stylex.props(css.accent)}>over</em>
        </>
      ) : (
        text
      )}
    </Element>
  );
}
export function PageIntro({
  fallbackHeading,
  blocks,
  identities,
  trivia,
  action,
  controls,
  fill = false,
}: PageIntroView & { readonly fill?: boolean }) {
  const firstHeadline = blocks.findIndex(
    (block) => block.kind === CopyKind.Headline,
  );
  return (
    <aside
      {...stylex.props(css.intro, fill && css.fill)}
      aria-label="Page introduction"
    >
      <div>
        <div {...stylex.props(css.identities)}>
          {identities.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <Editable label="identity label" actions={item.actions}>
                <span>{item.label}</span>
              </Editable>
            </Fragment>
          ))}
        </div>
        <div {...stylex.props(css.copy)}>
          {fallbackHeading !== null && <Title text={fallbackHeading} primary />}
          {blocks.map((block, index) => (
            <Editable
              key={block.key}
              label="intro text"
              actions={block.actions}
            >
              {block.kind === CopyKind.Headline ? (
                <Title text={block.text} primary={index === firstHeadline} />
              ) : (
                <p {...stylex.props(bodyStyles[block.kind])}>{block.text}</p>
              )}
            </Editable>
          ))}
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
              Add intro text
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
      </div>
      <div {...stylex.props(css.bottom)}>
        {action !== null && (
          <ActionLink
            href={action.href}
            external={action.isExternal}
            icon={<img src={icons[action.icon]} alt="" />}
          >
            {action.label}
          </ActionLink>
        )}
        {trivia.length > 0 && (
          <div {...stylex.props(css.facts)}>
            {trivia.map((item) => (
              <Editable key={item.id} label="fact" actions={item.actions}>
                <dl {...stylex.props(css.fact)}>
                  <dt {...stylex.props(css.factLabel)}>{item.label}</dt>
                  <dd {...stylex.props(css.factValue)}>{item.value}</dd>
                </dl>
              </Editable>
            ))}
          </div>
        )}
        {controls?.addFact != null && (
          <Button
            variant="secondary"
            disabled={controls.disabled}
            onClick={controls.addFact}
          >
            Add fact
          </Button>
        )}
      </div>
    </aside>
  );
}
