import * as stylex from '@stylexjs/stylex';
import { useEntryFocus } from '../../ui/useEntryFocus';
import { InteriorLayout } from '../../ui/InteriorLayout/InteriorLayout.presentational';
import { PageIntro } from '../../ui/PageIntro/PageIntro.presentational';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { WorkCard } from '../../ui/WorkCard/WorkCard.presentational';
import { WorkDetail } from '../../ui/WorkDetail/WorkDetail.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import type { useVoiceoverPageState } from './useVoiceoverPageState';
const css = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2,minmax(0,1fr))',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: 12,
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 12 },
  detail: { outline: 'none' },
  selectedLabel: {
    display: { default: 'none', '@media (max-width: 760px)': 'block' },
    fontFamily: tokens.sans,
    fontSize: 10.2,
    color: tokens.secondary,
    letterSpacing: '1.84px',
    textTransform: 'uppercase',
    paddingTop: 28,
    paddingBottom: 16,
    paddingInline: 20,
  },
  empty: {
    fontFamily: tokens.sans,
    fontSize: 14,
    lineHeight: 1.6,
    color: tokens.secondary,
  },
});
export function VoiceoverPage({
  ready,
  error,
  retry,
  intro,
  section,
  rows,
  featured,
  selected,
  open,
  close,
  controls,
}: ReturnType<typeof useVoiceoverPageState>) {
  const { list, detail, remember } = useEntryFocus(selected?.id ?? null);
  const select = (id: number, button: HTMLButtonElement) => {
    remember(button);
    open(id);
  };
  return (
    <PageBoundary ready={ready} error={error} retry={retry}>
      <InteriorLayout
        selected={selected !== null}
        intro={intro !== null && <PageIntro {...intro} />}
      >
        {selected !== null ? (
          <div
            ref={detail}
            tabIndex={-1}
            {...stylex.props(css.detail)}
            role="region"
            aria-label={selected.title}
          >
            <div {...stylex.props(css.selectedLabel)}>
              {section.map((block) => block.text).join(' · ')}
              {section.length > 0 ? ' · ' : ''}Selected
            </div>
            <WorkDetail entry={selected} onClose={close} />
          </div>
        ) : (
          <div
            ref={list}
            tabIndex={-1}
            {...stylex.props(css.content)}
            role="region"
            aria-label="Roles"
          >
            <CopyBlocks blocks={section} />
            {featured !== null && (
              <WorkCard
                entry={featured}
                hero
                onOpen={(button) => select(featured.id, button)}
              />
            )}
            <div {...stylex.props(css.grid)}>
              {rows.map((entry) => (
                <WorkCard
                  key={entry.id}
                  entry={entry}
                  onOpen={(button) => select(entry.id, button)}
                />
              ))}
            </div>
            {rows.length === 0 && featured === null && (
              <p {...stylex.props(css.empty)}>Roles will appear here.</p>
            )}
            {controls !== null && (
              <div {...stylex.props(css.controls)}>
                <Button disabled={controls.disabled} onClick={controls.add}>
                  Add role
                </Button>
                <Button
                  variant="secondary"
                  disabled={controls.disabled}
                  onClick={controls.addHeading}
                >
                  Add section heading
                </Button>
              </div>
            )}
          </div>
        )}
      </InteriorLayout>
    </PageBoundary>
  );
}
