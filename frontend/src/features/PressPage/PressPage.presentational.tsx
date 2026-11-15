import * as stylex from '@stylexjs/stylex';
import { PageBoundary } from '../../ui/PageBoundary/PageBoundary.presentational';
import { InteriorLayout } from '../../ui/InteriorLayout/InteriorLayout.presentational';
import { PageIntro } from '../../ui/PageIntro/PageIntro.presentational';
import { CopyBlocks } from '../../ui/CopyBlocks/CopyBlocks.presentational';
import { CoverageCard } from '../../ui/CoverageCard/CoverageCard.presentational';
import { WorkDetail } from '../../ui/WorkDetail/WorkDetail.presentational';
import { Editable } from '../../ui/Editable/Editable.presentational';
import { Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import { useEntryFocus } from '../../ui/useEntryFocus';
import type { usePressPageState } from './usePressPageState';
const css = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: 14, outline: 'none' },
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
  table: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: {
      default: '90px minmax(0,1fr) auto',
      '@media (max-width: 760px)': '44px minmax(0,1fr)',
    },
    gap: 18,
    padding: '16px 2px',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    alignItems: 'center',
  },
  year: { fontFamily: tokens.sans, fontSize: 10.72, color: tokens.secondary },
  title: {
    fontFamily: tokens.serif,
    fontSize: 17.6,
    color: tokens.foreground,
    textDecoration: 'none',
    lineHeight: 1.25,
    margin: 0,
  },
  format: {
    fontFamily: tokens.sans,
    fontSize: 10.08,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: tokens.copy,
    gridColumn: { default: 'auto', '@media (max-width: 760px)': 2 },
  },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 12 },
  empty: {
    fontFamily: tokens.sans,
    fontSize: 14,
    color: tokens.secondary,
    lineHeight: 1.6,
  },
  detail: { outline: 'none' },
  selectedLabel: {
    display: { default: 'none', '@media (max-width: 760px)': 'block' },
    fontFamily: tokens.sans,
    fontSize: 10.2,
    letterSpacing: '1.84px',
    textTransform: 'uppercase',
    color: tokens.secondary,
    padding: '28px 20px 16px',
  },
});
export function PressPage({
  ready,
  error,
  retry,
  intro,
  coverageHeading,
  appearanceHeading,
  entries,
  featured,
  selected,
  open,
  close,
  appearances,
  controls,
}: ReturnType<typeof usePressPageState>) {
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
            role="region"
            aria-label={selected.title}
            {...stylex.props(css.detail)}
          >
            <div {...stylex.props(css.selectedLabel)}>Press · Selected</div>
            <WorkDetail entry={selected} onClose={close} />
          </div>
        ) : (
          <div
            ref={list}
            tabIndex={-1}
            role="region"
            aria-label="Coverage"
            {...stylex.props(css.stack)}
          >
            {featured !== null && (
              <>
                <h2 {...stylex.props(css.label)}>Featured</h2>
                <CoverageCard
                  entry={featured}
                  featured
                  onOpen={(button) => select(featured.id, button)}
                />
              </>
            )}
            <section
              aria-label="Interviews and features"
              {...stylex.props(css.section)}
            >
              <CopyBlocks blocks={coverageHeading} sectionHeading />
              <div {...stylex.props(css.grid)}>
                {entries.map((entry) => (
                  <CoverageCard
                    key={entry.id}
                    entry={entry}
                    onOpen={(button) => select(entry.id, button)}
                  />
                ))}
              </div>
              {entries.length === 0 && featured === null && (
                <p {...stylex.props(css.empty)}>Coverage will appear here.</p>
              )}
              {controls !== null && (
                <div {...stylex.props(css.controls)}>
                  <Button
                    disabled={controls.disabled}
                    onClick={controls.addCoverage}
                  >
                    Add coverage
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={controls.disabled}
                    onClick={controls.addCoverageHeading}
                  >
                    Add coverage heading
                  </Button>
                </div>
              )}
            </section>
            <section aria-label="Appearances" {...stylex.props(css.section)}>
              <CopyBlocks blocks={appearanceHeading} sectionHeading />
              <div {...stylex.props(css.table)}>
                {appearances.map((row) => (
                  <Editable
                    key={row.id}
                    actions={row.actions}
                    label={row.title}
                  >
                    <div {...stylex.props(css.row)}>
                      <span {...stylex.props(css.year)}>{row.year}</span>
                      {row.url === null ? (
                        <p {...stylex.props(css.title)}>{row.title}</p>
                      ) : (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...stylex.props(css.title)}
                        >
                          {row.title}
                        </a>
                      )}
                      <span {...stylex.props(css.format)}>{row.format}</span>
                    </div>
                  </Editable>
                ))}
              </div>
              {appearances.length === 0 && (
                <p {...stylex.props(css.empty)}>
                  Appearances will appear here.
                </p>
              )}
              {controls !== null && (
                <div {...stylex.props(css.controls)}>
                  <Button
                    disabled={controls.disabled}
                    onClick={controls.addAppearance}
                  >
                    Add appearance
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={controls.disabled}
                    onClick={controls.addAppearanceHeading}
                  >
                    Add appearances heading
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}
      </InteriorLayout>
    </PageBoundary>
  );
}
