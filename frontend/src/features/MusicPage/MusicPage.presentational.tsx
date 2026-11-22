import * as stylex from '@stylexjs/stylex';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { InteriorLayout } from '../../ui/InteriorLayout/InteriorLayout.presentational';
import { PageIntro } from '../../ui/PageIntro/PageIntro.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { Editable } from '../../ui/Editable/Editable.presentational';
import { ActionLink, Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import play from '../../assets/design/play.svg';
import external from '../../assets/design/external-small.svg';
import type { useMusicPageState } from './useMusicPageState';
const css = stylex.create({
  practiceLabel: {
    fontFamily: tokens.sans,
    fontWeight: 400,
    fontSize: 10.2,
    letterSpacing: '1.84px',
    textTransform: 'uppercase',
    color: tokens.secondary,
    margin: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 16 },
  practice: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    minHeight: { default: 478.08, '@media (max-width: 760px)': 0 },
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    overflow: 'hidden',
  },
  practiceBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 14,
    padding: { default: 38, '@media (max-width: 760px)': 20 },
    minWidth: 0,
    gridRow: { default: 1, '@media (max-width: 760px)': 2 },
    paddingBottom: { default: 68, '@media (max-width: 760px)': 20 },
  },
  practiceImage: {
    position: 'relative',
    minWidth: 0,
    height: { default: 446.2, '@media (max-width: 760px)': 300 },
    gridColumn: { default: 2, '@media (max-width: 760px)': 1 },
    gridRow: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(90deg,rgba(9,9,9,.72),rgba(9,9,9,.16) 38%,rgba(9,9,9,.02) 72%),linear-gradient(0deg,rgba(9,9,9,.24),transparent 34%)',
  },
  eyebrow: {
    fontFamily: tokens.sans,
    fontSize: 9.5,
    letterSpacing: '1.6px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  practiceTitle: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 77.76, '@media (max-width: 760px)': 54 },
    lineHeight: 0.92,
    letterSpacing: '-.04em',
    color: tokens.foreground,
    margin: 0,
  },
  description: {
    fontFamily: tokens.sans,
    fontSize: { default: 12.8, '@media (max-width: 760px)': 12.4 },
    lineHeight: 1.52,
    color: tokens.secondary,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: 18,
    paddingTop: 13,
    marginTop: 8,
    marginBottom: 2,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    fontFamily: tokens.sans,
  },
  label: {
    fontSize: 8.64,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: tokens.secondary,
  },
  value: {
    fontSize: 11.84,
    lineHeight: 1.38,
    color: tokens.foreground,
    marginInline: 0,
    marginTop: 5,
  },
  action: { display: 'grid' },
  releases: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingTop: { default: 0, '@media (max-width: 760px)': 32 },
    scrollMarginTop: 24,
  },
  release: {
    display: 'grid',
    gridTemplateColumns: {
      default: '34% minmax(0,1fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    minHeight: 210,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    position: 'relative',
    transition: 'transform .5s ease-in-out, border-color .5s ease-in-out',
    ':hover': {
      transform: 'translateY(-4px)',
      borderColor: tokens.accentBorder,
    },
    ':focus-within': {
      transform: 'translateY(-4px)',
      borderColor: tokens.accentBorder,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      transform: 'none',
    },
  },
  artwork: {
    position: 'relative',
    height: { default: 208, '@media (max-width: 760px)': 220 },
    overflow: 'hidden',
  },
  artworkTitle: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
    fontFamily: tokens.serif,
    fontSize: 24.8,
    lineHeight: 1,
    whiteSpace: 'pre-line',
    color: tokens.foreground,
    margin: 0,
  },
  artworkScrim: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(180deg,rgba(9,9,9,.02),rgba(9,9,9,.75))',
  },
  releaseBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
    padding: { default: '24px 28px', '@media (max-width: 760px)': 18 },
    minWidth: 0,
  },
  details: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 },
  title: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 32, '@media (max-width: 760px)': 27 },
    lineHeight: 1.03,
    letterSpacing: '-.64px',
    color: tokens.foreground,
    margin: 0,
  },
  releaseDescription: {
    fontFamily: tokens.sans,
    fontSize: { default: 11.52, '@media (max-width: 760px)': 12.2 },
    lineHeight: 1.5,
    color: tokens.secondary,
    margin: 0,
  },
  link: {
    display: 'inline-flex',
    gap: 5,
    alignItems: 'center',
    fontFamily: tokens.sans,
    fontSize: 10.88,
    letterSpacing: '.435px',
    color: tokens.copy,
    textDecoration: 'none',
    ':hover': { color: tokens.accent },
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 12 },
  empty: { fontFamily: tokens.sans, fontSize: 14, color: tokens.secondary },
});
export function MusicPage({
  ready,
  error,
  retry,
  intro,
  releaseHeading,
  practice,
  releases,
  controls,
}: ReturnType<typeof useMusicPageState>) {
  return (
    <PageBoundary ready={ready} error={error} retry={retry}>
      <InteriorLayout intro={intro !== null && <PageIntro {...intro} />}>
        <div {...stylex.props(css.section)}>
          <h2 {...stylex.props(css.practiceLabel)}>Current practice</h2>
          {practice !== null && (
            <Editable
              label="current practice"
              actions={practice.actions}
              placement="inside"
            >
              <section
                {...stylex.props(css.practice)}
                aria-label="Current practice"
              >
                <div {...stylex.props(css.practiceBody)}>
                  <p {...stylex.props(css.eyebrow)}>{practice.eyebrow}</p>
                  <h2 {...stylex.props(css.practiceTitle)}>{practice.title}</h2>
                  <p {...stylex.props(css.description)}>
                    {practice.description}
                  </p>
                  {practice.facts.length > 0 && (
                    <dl {...stylex.props(css.facts)}>
                      {practice.facts.map((fact) => (
                        <div key={`${fact.label}/${fact.value}`}>
                          <dt {...stylex.props(css.label)}>{fact.label}</dt>
                          <dd {...stylex.props(css.value)}>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div {...stylex.props(css.action)}>
                    <ActionLink
                      href={practice.action.href}
                      external={practice.action.isExternal}
                      icon={<img src={play} alt="" />}
                    >
                      {practice.action.label}
                    </ActionLink>
                  </div>
                </div>
                <div {...stylex.props(css.practiceImage)}>
                  <img
                    {...stylex.props(css.image)}
                    src={practice.image.url}
                    alt={practice.image.altText}
                  />
                  <div {...stylex.props(css.scrim)} />
                </div>
              </section>
            </Editable>
          )}
          <section
            id="releases"
            aria-label="Music releases"
            {...stylex.props(css.releases)}
          >
            <CopyBlocks blocks={releaseHeading} sectionHeading />
            {releases.map((row) => (
              <Editable
                key={row.id}
                label={row.title}
                actions={row.actions}
                placement="inside"
              >
                <article {...stylex.props(css.release)}>
                  <div {...stylex.props(css.artwork)}>
                    <img
                      {...stylex.props(css.image)}
                      src={row.image.url}
                      alt={row.image.altText}
                      loading="lazy"
                    />
                    <div {...stylex.props(css.artworkScrim)} />
                    <p {...stylex.props(css.artworkTitle)}>
                      {row.artworkTitle}
                    </p>
                  </div>
                  <div {...stylex.props(css.releaseBody)}>
                    <div {...stylex.props(css.details)}>
                      <p {...stylex.props(css.eyebrow)}>{row.eyebrow}</p>
                      <h3 {...stylex.props(css.title)}>{row.title}</h3>
                      <p {...stylex.props(css.releaseDescription)}>
                        {row.description}
                      </p>
                    </div>
                    <a
                      {...stylex.props(css.link)}
                      href={row.action.href}
                      target={row.action.isExternal ? '_blank' : undefined}
                      rel={
                        row.action.isExternal
                          ? 'noopener noreferrer'
                          : undefined
                      }
                    >
                      {row.action.label}
                      {row.action.isExternal && <img src={external} alt="" />}
                    </a>
                  </div>
                </article>
              </Editable>
            ))}
            {releases.length === 0 && (
              <p {...stylex.props(css.empty)}>Releases will appear here.</p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button disabled={controls.disabled} onClick={controls.add}>
                  Add release
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addReleaseHeading}
                >
                  Add releases heading
                </Button>
              </div>
            )}
          </section>
        </div>
      </InteriorLayout>
    </PageBoundary>
  );
}
