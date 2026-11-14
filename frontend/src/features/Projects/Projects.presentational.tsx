import * as stylex from '@stylexjs/stylex';
import { faSave, faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Icon,
  SpottedSection,
  Title,
} from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import { Video } from '../../ui/Video/Video.presentational';
import { Modal } from '../../ui/Modal/Modal.presentational';
import Failed from '../../assets/svg/FailedToLoad.svg?react';
import { ProjectForm } from './ProjectForm.presentational';
import type { useProjectsState } from './useProjectsState';
const css = stylex.create({
  pairedTitle: {
    marginBottom: { default: null, '@media (max-width: 455px)': '.5em' },
  },
  pair: {
    marginLeft: { default: '1em', '@media (max-width: 455px)': 0 },
    marginBottom: { default: 0, '@media (max-width: 455px)': '1em' },
  },
  titleButton: {
    width: { default: 'auto', '@media (max-width: 455px)': '100%' },
    marginLeft: { default: '1em', '@media (max-width: 455px)': 0 },
    marginBottom: { default: 0, '@media (max-width: 455px)': '1em' },
  },
  more: { margin: '0 auto', maxWidth: 400 },
  failure: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  failureImage: { height: 200 },
});
export function Projects(props: ReturnType<typeof useProjectsState>) {
  const {
    mode,
    loaded,
    projects,
    page,
    pages,
    errors,
    draft,
    open,
    busy,
    change,
    reset,
    show,
    save,
    saveAll,
    remove,
    nextPage,
    navigate,
  } = props;
  const form = (project: typeof draft, block = false) => (
    <ProjectForm
      key={project.id}
      {...project}
      thumbnail={project.thumbnail}
      embed={project.embed}
      onSrcChange={(value) => change(project.id, 'src', value)}
      onTitleChange={(value) => change(project.id, 'title', value)}
      onSubmit={() => void save(project.id)}
      onReset={() => reset(project.id)}
      onDelete={() => void remove(project.id)}
      busy={busy.includes(project.id)}
      errors={errors[project.id] ?? {}}
      block={block}
      showDelete={!block}
    />
  );
  const content = (
    <>
      {mode === 'editor' ? (
        <Modal
          open={open}
          onClose={() => show(false)}
          title={<span>Add new Project</span>}
        >
          {form(draft, true)}
        </Modal>
      ) : null}
      <div>
        <Title
          {...stylex.props(styles.title, styles.sectionTitle, css.pairedTitle)}
          id={mode === 'latest' ? 'latestProjects' : undefined}
        >
          {mode === 'latest' ? 'Latest Projects' : 'All Projects'}
        </Title>
        {mode === 'editor' ? (
          <div {...stylex.props(styles.pair, css.pair)}>
            <Button
              {...stylex.props(
                styles.button,
                styles.primary,
                styles.inlineButton,
              )}
              onClick={() => void saveAll()}
            >
              Save All <Icon definition={faSave} />
            </Button>
            <Button
              variant="secondary"
              {...stylex.props(
                styles.button,
                styles.secondary,
                styles.inlineButton,
              )}
              onClick={() => show(true)}
            >
              Add New Project <Icon definition={faPlus} />
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            {...stylex.props(styles.button, styles.secondary, css.titleButton)}
            onClick={() => navigate(mode === 'latest' ? '/projects' : '/')}
          >
            {mode === 'latest' ? 'See all projects' : 'Go back'}
          </Button>
        )}
      </div>
      <div {...stylex.props(styles.wrapped)}>
        {projects.map((project) =>
          mode === 'editor' ? (
            form(project)
          ) : (
            <Video
              key={project.id}
              title={project.title}
              thumbnail={project.thumbnail}
              embed={project.embed}
            />
          ),
        )}
        {!projects.length && loaded ? (
          <div {...stylex.props(css.failure)}>
            <Failed {...stylex.props(css.failureImage)} />
            <p {...stylex.props(styles.content)}>Failed to load...</p>
          </div>
        ) : (
          ''
        )}
      </div>
      {mode === 'latest' ? (
        <div {...stylex.props(styles.buttonRow, css.more)}>
          <Button
            variant="secondary"
            aria-disabled={page >= pages}
            disabled={page >= pages}
            onClick={() => void nextPage()}
          >
            Load more
          </Button>
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            See all projects
          </Button>
        </div>
      ) : null}
    </>
  );
  return mode === 'all' ? content : <SpottedSection>{content}</SpottedSection>;
}
