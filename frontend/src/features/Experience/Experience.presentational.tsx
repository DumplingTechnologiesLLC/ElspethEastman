import { Category } from '../../domain/models/Category';
import * as stylex from '@stylexjs/stylex';
import {
  faCheckSquare,
  faSquare,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Field,
  Icon,
  Subtitle,
  Title,
} from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import { Modal } from '../../ui/Modal/Modal.presentational';
import External from '../../assets/svg/ExternalLink.svg?react';
import type { useExperienceState } from './useExperienceState';
const css = stylex.create({
  container: { marginTop: '10em' },
  row: { display: 'flex', minWidth: '100%', flexWrap: 'wrap' },
  column: {
    flex: 1,
    minWidth: 'max(50%, 300px)',
    display: 'flex',
    flexDirection: 'column',
  },
  section: { flex: 1, padding: '1em' },
  voice: { backgroundColor: 'rgba(1,208,254,.3)' },
  games: { backgroundColor: 'rgba(253,255,138,.3)' },
  music: { backgroundColor: 'rgba(255,155,255,.3)' },
  streaming: { backgroundColor: 'rgba(2,219,136,.342)' },
  voiceEditor: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(1,208,254,.3)',
  },
  gamesEditor: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(253,255,138,.3)',
  },
  musicEditor: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(255,155,255,.3)',
  },
  streamingEditor: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgba(2,219,136,.342)',
  },
  voiceTitle: { color: '#002C36' },
  gamesTitle: { color: '#585800' },
  musicTitle: { color: '#630063' },
  streamingTitle: { color: '#02311f' },
  heading: { fontSize: '1.25em' },
  line: {
    fontFamily: 'Montserrat, sans-serif',
    color: '#292929',
    fontSize: '.9em',
    display: 'block',
    textDecoration: 'none',
    marginBottom: '1em',
    fill: '#292929',
  },
  inline: { display: 'inline-block', marginBottom: 0 },
  external: { height: '1em' },
  editLine: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '.25em',
    height: 40,
  },
  mini: {
    display: 'inline',
    whiteSpace: 'nowrap',
    width: 'auto',
    marginRight: '.25em',
  },
  checkbox: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    userSelect: 'none',
  },
  checkboxInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    cursor: 'pointer',
    opacity: 0,
  },
  checkboxIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    pointerEvents: 'none',
    color: '#00B3D9',
    height: 40,
    marginRight: '.25em',
  },
});
const sections = [
  {
    category: Category.VoiceCredits,
    public: css.voice,
    editor: css.voiceEditor,
    title: css.voiceTitle,
    add: 'Add new credit',
  },
  {
    category: Category.MusicGames,
    public: css.games,
    editor: css.gamesEditor,
    title: css.gamesTitle,
    add: 'Add new music',
  },
  {
    category: Category.MusicMiscellaneous,
    public: css.music,
    editor: css.musicEditor,
    title: css.musicTitle,
    add: 'Add new music',
  },
  {
    category: Category.StreamingCredits,
    public: css.streaming,
    editor: css.streamingEditor,
    title: css.streamingTitle,
    add: 'Add new credit',
  },
] as const;
export function Experience({
  editor,
  loaded,
  groups,
  draft,
  open,
  errors,
  year,
  edit,
  close,
  change,
  reset,
  save,
  remove,
}: ReturnType<typeof useExperienceState>) {
  return (
    <section {...stylex.props(css.container)}>
      {editor ? (
        <Modal open={open} onClose={close} title={<span>Experience Form</span>}>
          {open ? (
            <form {...stylex.props(styles.form)}>
              <Field
                type="number"
                name="ExperienceYear"
                label="Year"
                value={draft.year}
                onChange={(value) => change('year', value)}
                error={errors.year}
              />
              <Field
                name="ExperienceLink"
                label="Link to credit"
                value={draft.link}
                onChange={(value) => change('link', value)}
                error={errors.link}
              />
              <Field
                name="ExperienceCredit"
                label="Credit text"
                value={draft.credit}
                onChange={(value) => change('credit', value)}
                error={errors.credit}
              />
              <div {...stylex.props(styles.field, styles.noBottomGap)}>
                <label
                  {...stylex.props(styles.content, css.checkbox)}
                  htmlFor="ExperienceTBA"
                  onClick={() => change('tba', !draft.tba)}
                >
                  <input
                    {...stylex.props(css.checkboxInput)}
                    type="checkbox"
                    name="ExperienceTBA"
                    checked={draft.tba}
                    onChange={(event) => change('tba', event.target.checked)}
                  />
                  <div {...stylex.props(css.checkboxIcon)}>
                    <Icon definition={draft.tba ? faCheckSquare : faSquare} />
                  </div>
                  TBA?
                </label>
              </div>
              <div {...stylex.props(styles.buttonRow)}>
                <Button type="button" onClick={() => void save()}>
                  Save
                </Button>
                <Button variant="warning" type="button" onClick={reset}>
                  Reset Changes
                </Button>
              </div>
            </form>
          ) : (
            <span>Loading</span>
          )}
        </Modal>
      ) : null}
      <Title id="Experience">
        Experience
        <br />
        {editor ? '' : ' '}
        <Subtitle>2012 -{year}</Subtitle>
      </Title>
      <div {...stylex.props(css.row)}>
        {sections.map((section) => (
          <div {...stylex.props(css.column)} key={section.category}>
            <div
              {...stylex.props(
                css.section,
                editor ? section.editor : section.public,
              )}
            >
              <h3 {...stylex.props(styles.title, css.heading, section.title)}>
                {section.category}
              </h3>
              {loaded ? (
                groups[section.category].length ? (
                  groups[section.category].map((experience) => {
                    const Tag = experience.link ? 'a' : 'p';
                    const line = (
                      <Tag
                        {...stylex.props(css.line, editor && css.inline)}
                        href={experience.link ?? undefined}
                        target={experience.link ? '_blank' : undefined}
                        rel="noreferrer"
                      >
                        {experience.year
                          ? `${experience.year} ${experience.credit}`
                          : experience.credit}
                        {experience.link ? (
                          <External {...stylex.props(css.external)} />
                        ) : (
                          ''
                        )}
                      </Tag>
                    );
                    return editor ? (
                      <div {...stylex.props(css.editLine)} key={experience.id}>
                        <Button
                          variant="danger"
                          {...stylex.props(
                            styles.button,
                            styles.danger,
                            css.mini,
                          )}
                          onClick={() =>
                            void remove(section.category, experience.id)
                          }
                        >
                          <Icon definition={faTrash} />
                        </Button>
                        <Button
                          {...stylex.props(
                            styles.button,
                            styles.primary,
                            css.mini,
                          )}
                          onClick={() => edit(section.category, experience)}
                        >
                          <Icon definition={faEdit} />
                        </Button>
                        {line}
                      </div>
                    ) : (
                      <div key={experience.id} style={{ display: 'contents' }}>
                        {line}
                      </div>
                    );
                  })
                ) : editor ? null : (
                  <p {...stylex.props(css.line)}>Coming soon!</p>
                )
              ) : (
                <p {...stylex.props(css.line)}>Loading</p>
              )}
              {editor ? (
                <Button onClick={() => edit(section.category)}>
                  {section.add}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
