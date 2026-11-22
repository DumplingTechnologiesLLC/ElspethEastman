import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { InteriorLayout } from '../../ui/InteriorLayout/InteriorLayout.presentational';
import { PageIntro } from '../../ui/PageIntro/PageIntro.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { Editable } from '../../ui/Editable/Editable.presentational';
import { Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import external from '../../assets/design/macro-arrow.svg';
import type { useBioPageState } from './useBioPageState';
const css = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: 32 },
  feature: {
    display: 'grid',
    gridTemplateColumns: {
      default: '44% minmax(0,1fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    minHeight: { default: 478.08, '@media (max-width: 760px)': 0 },
  },
  figure: { margin: 0, minWidth: 0 },
  portraitFrame: {
    height: { default: 476.08, '@media (max-width: 760px)': 410 },
    overflow: 'hidden',
  },
  portrait: {
    display: 'block',
    width: '100%',
    height: { default: 476.08, '@media (max-width: 760px)': 410 },
    objectFit: 'cover',
    objectPosition: 'center 67%',
    transform: 'scale(1.135)',
  },
  caption: {
    fontFamily: tokens.sans,
    fontSize: 11,
    color: tokens.secondary,
    padding: 8,
  },
  featureBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 14,
    padding: { default: 54, '@media (max-width: 760px)': 20 },
    minWidth: 0,
  },
  label: {
    fontFamily: tokens.sans,
    fontSize: 9.44,
    fontWeight: 400,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 14 },
  chapters: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
  },
  chapter: {
    display: 'grid',
    gridTemplateColumns: {
      default: '25% minmax(0,1fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: { default: 56, '@media (max-width: 760px)': 12 },
    paddingBlock: 31.872,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
  },
  chapterBody: { display: 'flex', flexDirection: 'column', gap: 12 },
  heading: {
    fontFamily: tokens.serif,
    fontSize: { default: 38.4, '@media (max-width: 760px)': 27 },
    lineHeight: 1.08,
    letterSpacing: '-.025em',
    fontWeight: 400,
    color: tokens.foreground,
    margin: 0,
  },
  body: {
    fontFamily: tokens.sans,
    fontSize: 12.48,
    lineHeight: 1.65,
    color: tokens.secondary,
    whiteSpace: 'pre-line',
    margin: 0,
  },
  current: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3,minmax(0,1fr))',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: 1,
    backgroundColor: tokens.line,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
  },
  currentCard: {
    boxSizing: 'border-box',
    minHeight: 132,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.modal,
    padding: 24,
  },
  currentTitle: {
    fontFamily: tokens.serif,
    fontSize: 27.2,
    lineHeight: 1.15,
    fontWeight: 400,
    color: tokens.foreground,
    margin: 0,
  },
  currentLink: {
    fontFamily: tokens.sans,
    fontSize: 11,
    color: tokens.copy,
    textDecoration: 'none',
    ':hover': { color: tokens.accent },
  },
  explore: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2,minmax(0,1fr))',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: 10,
  },
  anchor: {
    boxSizing: 'border-box',
    minHeight: 116,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    backgroundColor: tokens.modal,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: tokens.line,
      ':hover': tokens.accent,
      ':focus-visible': tokens.accent,
    },
    fontFamily: tokens.serif,
    fontSize: 28.8,
    color: tokens.foreground,
    textDecoration: 'none',
    transition: {
      default: 'border-color .25s ease',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  anchorText: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    transform: 'translateY(0)',
    transition: {
      default: 'transform .25s ease',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
  },
  anchorActive: {
    transform: {
      default: 'translateY(-10px)',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 12 },
  empty: {
    fontFamily: tokens.sans,
    fontSize: 14,
    color: tokens.secondary,
    lineHeight: 1.6,
  },
});
export function BioPage({
  ready,
  error,
  retry,
  intro,
  portrait,
  biography,
  storyHeading,
  currentHeading,
  exploreHeading,
  chapters,
  current,
  explore,
  navigate,
  controls,
}: ReturnType<typeof useBioPageState>) {
  const [hovered, setHovered] = useState<string | null>(null),
    [focused, setFocused] = useState<string | null>(null);
  return (
    <PageBoundary ready={ready} error={error} retry={retry}>
      <InteriorLayout
        stretchIntro
        intro={intro !== null && <PageIntro {...intro} fill />}
      >
        <div {...stylex.props(css.stack)}>
          <section aria-label="Short biography" {...stylex.props(css.feature)}>
            {portrait !== null && (
              <Editable
                actions={portrait.actions}
                label="portrait"
                placement="inside"
              >
                <figure {...stylex.props(css.figure)}>
                  <div {...stylex.props(css.portraitFrame)}>
                    <img
                      {...stylex.props(css.portrait)}
                      src={portrait.url}
                      alt={portrait.altText}
                    />
                  </div>
                  {portrait.caption !== '' && (
                    <figcaption {...stylex.props(css.caption)}>
                      {portrait.caption}
                    </figcaption>
                  )}
                </figure>
              </Editable>
            )}
            <div {...stylex.props(css.featureBody)}>
              <h2 {...stylex.props(css.label)}>The short version</h2>
              <CopyBlocks blocks={biography} compact />
              {controls !== null && (
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addBiography}
                >
                  Add biography text
                </Button>
              )}
            </div>
          </section>
          <section
            aria-label="Biography chapters"
            {...stylex.props(css.section)}
          >
            <CopyBlocks blocks={storyHeading} sectionHeading />
            <div {...stylex.props(css.chapters)}>
              {chapters.map((row) => (
                <Editable
                  key={row.id}
                  label={row.heading}
                  actions={row.actions}
                >
                  <article {...stylex.props(css.chapter)}>
                    <p {...stylex.props(css.label)}>{row.eyebrow}</p>
                    <div {...stylex.props(css.chapterBody)}>
                      <h3 {...stylex.props(css.heading)}>{row.heading}</h3>
                      <p {...stylex.props(css.body)}>{row.body}</p>
                    </div>
                  </article>
                </Editable>
              ))}
            </div>
            {chapters.length === 0 && (
              <p {...stylex.props(css.empty)}>Chapters will appear here.</p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button
                  disabled={controls.disabled}
                  onClick={controls.addChapter}
                >
                  Add chapter
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addStoryHeading}
                >
                  Add story heading
                </Button>
              </div>
            )}
          </section>
          <section aria-label="Current work" {...stylex.props(css.section)}>
            <CopyBlocks blocks={currentHeading} sectionHeading />
            <div {...stylex.props(css.current)}>
              {current.map((row) => (
                <Editable
                  key={row.id}
                  label={row.title}
                  actions={row.actions}
                  placement="inside"
                >
                  <article {...stylex.props(css.currentCard)}>
                    <p {...stylex.props(css.label)}>{row.eyebrow}</p>
                    <h3 {...stylex.props(css.currentTitle)}>{row.title}</h3>
                    <p {...stylex.props(css.body)}>{row.description}</p>
                    {row.link !== null && (
                      <a
                        {...stylex.props(css.currentLink)}
                        href={row.link.href}
                        target={row.link.isExternal ? '_blank' : undefined}
                        rel={
                          row.link.isExternal
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {row.link.label}
                      </a>
                    )}
                  </article>
                </Editable>
              ))}
            </div>
            {current.length === 0 && (
              <p {...stylex.props(css.empty)}>Current work will appear here.</p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button
                  disabled={controls.disabled}
                  onClick={controls.addCurrent}
                >
                  Add current work
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addCurrentHeading}
                >
                  Add current heading
                </Button>
              </div>
            )}
          </section>
          <section aria-label="Explore the work" {...stylex.props(css.section)}>
            <CopyBlocks blocks={exploreHeading} sectionHeading />
            <div {...stylex.props(css.explore)}>
              {explore.map((row) => (
                <a
                  key={row.id}
                  href={row.href}
                  {...stylex.props(css.anchor)}
                  onMouseEnter={() => setHovered(row.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setFocused(row.id)}
                  onBlur={() => setFocused(null)}
                  onClick={(event) => {
                    if (
                      event.button === 0 &&
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey &&
                      !event.defaultPrevented
                    ) {
                      event.preventDefault();
                      navigate(row.href);
                    }
                  }}
                >
                  <span
                    {...stylex.props(
                      css.anchorText,
                      (hovered === row.id || focused === row.id) &&
                        css.anchorActive,
                    )}
                  >
                    {row.label}
                    <img src={external} alt="" />
                  </span>
                </a>
              ))}
            </div>
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addExploreHeading}
                >
                  Add explore heading
                </Button>
              </div>
            )}
          </section>
        </div>
      </InteriorLayout>
    </PageBoundary>
  );
}
