import * as stylex from '@stylexjs/stylex';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { InteriorLayout } from '../../ui/InteriorLayout/InteriorLayout.presentational';
import { PageIntro } from '../../ui/PageIntro/PageIntro.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { WorkCard } from '../../ui/WorkCard/WorkCard.presentational';
import { TextCard } from '../../ui/TextCard/TextCard.presentational';
import { Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import type { useStreamingPageState } from './useStreamingPageState';
const css = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: 14 },
  section: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2,minmax(0,1fr))',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: 12,
  },
  label: {
    fontFamily: tokens.sans,
    fontSize: 10.24,
    letterSpacing: '1.84px',
    fontWeight: 400,
    textTransform: 'uppercase',
    color: tokens.secondary,
    margin: 0,
  },
  empty: {
    fontFamily: tokens.sans,
    fontSize: 14,
    color: tokens.secondary,
    lineHeight: 1.6,
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 12 },
});
export function StreamingPage({
  ready,
  error,
  retry,
  intro,
  streamHeading,
  clipHeading,
  featured,
  rows,
  clips,
  controls,
}: ReturnType<typeof useStreamingPageState>) {
  return (
    <PageBoundary ready={ready} error={error} retry={retry}>
      <InteriorLayout intro={intro !== null && <PageIntro {...intro} />}>
        <div {...stylex.props(css.stack)}>
          {featured !== null && (
            <>
              <h2 {...stylex.props(css.label)}>Latest stream</h2>
              <WorkCard entry={featured} banner />
            </>
          )}
          <section aria-label="Recent streams" {...stylex.props(css.section)}>
            <CopyBlocks blocks={streamHeading} />
            <div {...stylex.props(css.grid)}>
              {rows.map((entry) => (
                <TextCard key={entry.id} entry={entry} />
              ))}
            </div>
            {rows.length === 0 && (
              <p {...stylex.props(css.empty)}>
                Recent streams will appear here.
              </p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button
                  disabled={controls.disabled}
                  onClick={controls.addStream}
                >
                  Add stream
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addStreamHeading}
                >
                  Add streams heading
                </Button>
              </div>
            )}
          </section>
          <section aria-label="Clips" {...stylex.props(css.section)}>
            <CopyBlocks blocks={clipHeading} />
            <div {...stylex.props(css.grid)}>
              {clips.map((entry) => (
                <TextCard key={entry.id} entry={entry} compact />
              ))}
            </div>
            {clips.length === 0 && (
              <p {...stylex.props(css.empty)}>Clips will appear here.</p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button disabled={controls.disabled} onClick={controls.addClip}>
                  Add clip
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addClipHeading}
                >
                  Add clips heading
                </Button>
              </div>
            )}
          </section>
        </div>
      </InteriorLayout>
    </PageBoundary>
  );
}
