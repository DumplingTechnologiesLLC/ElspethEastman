import * as stylex from '@stylexjs/stylex';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Field,
  Icon,
  Paragraph,
  SpottedSection,
} from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import Elephant from '../../assets/elephant.webp';
import { piePaths } from './piePaths';
import type { useSkillsState } from './useSkillsState';
const css = stylex.create({
  description: {
    textAlign: 'center',
    minWidth: { default: 420, '@media (max-width: 580px)': 200 },
  },
  pie: { position: 'relative', display: 'flex', justifyContent: 'center' },
  pieText: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    fontWeight: 'bold',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    maxHeight: { default: 400, '@media (max-width: 580px)': 300 },
    minHeight: 250,
    height: '100%',
  },
  text: {
    fill: 'white',
    fontFamily: 'Montserrat',
    fontSize: '1.1em',
    fontWeight: 'bold',
    pointerEvents: 'none',
    transition: 'opacity .3s ease-out',
  },
  path: {
    cursor: 'pointer',
    transition: 'fill .3s ease-out',
    fill: '#007A94',
    ':hover': { fill: '#0098B8' },
  },
  active: { fill: '#01d1fe', ':hover': { fill: '#01d1fe' } },
  editor: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    display: 'flex',
  },
  buttons: { marginTop: '1em' },
  contentTitle: {
    marginBottom: 0,
    display: 'inline-block',
    position: 'relative',
  },
});
export function Skills({
  editor,
  loaded,
  draft,
  skills,
  lookup,
  selected,
  errors,
  submitting,
  select,
  change,
  reset,
  save,
}: ReturnType<typeof useSkillsState>) {
  return (
    <SpottedSection>
      <div {...stylex.props(styles.row)}>
        <div {...stylex.props(styles.column, css.pie)}>
          <div {...stylex.props(css.pieText)}>
            <span {...stylex.props(styles.content)}>Select One</span>
          </div>
          <svg {...stylex.props(css.svg)} x="0px" y="0px" viewBox="0 0 500 500">
            <g>
              {(['streaming', 'game_development', 'voice_acting'] as const).map(
                (key, index) => (
                  <g key={key}>
                    <path
                      {...stylex.props(
                        css.path,
                        loaded && selected === key && css.active,
                      )}
                      aria-label={lookup[key]}
                      role="button"
                      tabIndex={0}
                      onClick={() => select(key)}
                      d={piePaths[index]}
                    />
                    <text
                      {...stylex.props(css.text)}
                      transform={
                        index === 0
                          ? 'translate(50 320)'
                          : index === 1
                            ? 'translate(270 80)'
                            : 'translate(340 320)'
                      }
                    >
                      {key === 'game_development' ? (
                        <>
                          <tspan x="-45" y="0">
                            {lookup[key]?.split(' ')[0] ?? ''}
                          </tspan>
                          <tspan x="-78.309" y="27">
                            {lookup[key]?.split(' ')[1] ?? 'Loading'}
                          </tspan>
                        </>
                      ) : (
                        <tspan x="0" y="0">
                          {lookup[key]}
                        </tspan>
                      )}
                    </text>
                  </g>
                ),
              )}
            </g>
            <image
              width="1904"
              height="1243"
              xlinkHref={Elephant}
              transform="matrix(-0.0748 0 0 0.0792 318.7545 200.7607)"
            />
          </svg>
        </div>
        <div
          {...stylex.props(
            styles.column,
            css.description,
            editor && css.editor,
          )}
        >
          {editor ? (
            <>
              <Field
                multiline
                noBottomGap
                minHeight={150}
                name={lookup[selected] ?? ''}
                label={lookup[selected] ?? ''}
                onChange={change}
                value={
                  loaded
                    ? lookup[selected]
                      ? draft[selected]
                      : 'Skills failed to load.'
                    : 'Loading...'
                }
                error={errors[selected]}
              />
              <div {...stylex.props(styles.buttonRow, css.buttons)}>
                <Button variant="warning" onClick={reset}>
                  Reset Changes
                </Button>
                <Button
                  onClick={() => void save()}
                  disabled={submitting}
                  aria-disabled={submitting}
                >
                  Save All Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 {...stylex.props(styles.title, css.contentTitle)}>
                {lookup[selected] ?? ''}
              </h2>
              <Paragraph>
                {loaded ? (
                  lookup[selected] ? (
                    skills[selected]
                  ) : (
                    'Skills failed to load...'
                  )
                ) : (
                  <Icon definition={faSpinner} size="1.33333em" pulse />
                )}
              </Paragraph>
            </>
          )}
        </div>
      </div>
    </SpottedSection>
  );
}
