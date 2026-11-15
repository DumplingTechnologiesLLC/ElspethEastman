import * as stylex from '@stylexjs/stylex';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button, Icon } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import { Modal } from '../../ui/Modal/Modal.presentational';
import { CircularStat } from '../../ui/CircularStat/CircularStat.presentational';
import Instagram from '../../assets/svg/Instagram.svg';
import Soundcloud from '../../assets/svg/Soundcloud.svg';
import Twitter from '../../assets/svg/Twitter.svg';
import Youtube from '../../assets/svg/Youtube.svg';
import { AffiliationForm } from './AffiliationForm.presentational';
import type { useFooterState } from './useFooterState';
const css = stylex.create({
  footer: {
    backgroundColor: '#005F74',
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
  },
  title: { fontFamily: 'Dolcissimo, sans-serif', fontWeight: 'bold' },
  subtitle: {
    fontFamily: 'Dolcissimo, sans-serif',
    fontWeight: 'bold',
    fontSize: '1.25em',
    margin: 0,
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  affiliationsAndLinks: {
    display: 'flex',
    paddingTop: '2em',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  affiliations: { display: 'flex', flexDirection: 'column', minWidth: 200 },
  editorAffiliations: { minWidth: 400 },
  socialContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: { default: 0, '@media (max-width: 580px)': '1em' },
  },
  social: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: '.5em',
    minWidth: 200,
    justifyContent: 'space-between',
  },
  socialIcon: { height: 40 },
  link: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '1em',
    color: 'white',
    margin: '.25em 0',
    textDecoration: 'none',
    transition: 'color .2s ease-out',
    ':hover': { color: '#d6d6d6' },
    ':focus': { color: '#d6d6d6' },
    ':visited': { color: 'white' },
  },
  failed: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '1em',
    color: 'white',
    margin: '.25em 0',
  },
});
const social = [
  {
    src: Instagram,
    name: 'Instagram',
    url: 'https://www.instagram.com/elspetheastman/?hl=en',
  },
  {
    src: Soundcloud,
    name: 'Soundcloud',
    url: 'https://soundcloud.com/elspetheastman',
  },
  { src: Twitter, name: 'Twitter', url: 'https://twitter.com/elspetheastman' },
  {
    src: Youtube,
    name: 'Youtube',
    url: 'https://www.youtube.com/user/ratedEwithElspeth',
  },
];
export function Footer({
  editor,
  loaded,
  data,
  draft,
  errors,
  busy,
  open,
  change,
  reset,
  show,
  save,
  remove,
}: ReturnType<typeof useFooterState>) {
  const form = (affiliation: typeof draft, isNew = false) => (
    <AffiliationForm
      key={affiliation.id}
      text={affiliation.affiliation}
      link={affiliation.link ?? ''}
      onTextChange={(value) => change(affiliation.id, 'affiliation', value)}
      onLinkChange={(value) => change(affiliation.id, 'link', value)}
      onReset={() => reset(affiliation.id)}
      onSubmit={() => void save(affiliation.id)}
      onDelete={() => void remove(affiliation.id)}
      disabled={busy.includes(affiliation.id)}
      showDelete={!isNew}
      errors={errors[affiliation.id] ?? {}}
    />
  );
  const stats = (
    <div {...stylex.props(css.stats)} key={data.stats.length}>
      {!loaded ? (
        <Icon definition={faSpinner} size="6em" pulse />
      ) : !data.stats.length ? (
        <p {...stylex.props(css.failed)}>Failed to load stats.</p>
      ) : (
        data.stats.map((stat) => <CircularStat key={stat.id} {...stat} />)
      )}
    </div>
  );
  const links = (
    <>
      <h3 {...stylex.props(css.subtitle)}>Find me on social media</h3>
      <div {...stylex.props(css.social)}>
        {social.map((entry, index) => (
          <a
            key={entry.name}
            tabIndex={index === 0 ? 0 : undefined}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
          >
            <img
              {...stylex.props(css.socialIcon)}
              src={entry.src}
              alt={`${entry.name} icon`}
            />
          </a>
        ))}
      </div>
    </>
  );
  return (
    <footer {...stylex.props(css.footer)}>
      {editor ? (
        <Modal
          open={open}
          onClose={() => show(false)}
          title={<span>Add new Affiliation</span>}
        >
          {form(draft, true)}
        </Modal>
      ) : null}
      <h2 {...stylex.props(css.title)}>Interesting Facts</h2>
      {editor ? (
        <div {...stylex.props(styles.disabledSection)}>{stats}</div>
      ) : (
        stats
      )}
      <div {...stylex.props(css.affiliationsAndLinks)}>
        <div
          {...stylex.props(css.affiliations, editor && css.editorAffiliations)}
        >
          <h3 {...stylex.props(css.subtitle)}>Affiliations</h3>
          {!loaded ? (
            <Icon definition={faSpinner} size="1.33333em" pulse />
          ) : (
            data.affiliations.map((affiliation) =>
              editor ? (
                form(affiliation)
              ) : (
                <a
                  {...stylex.props(css.link)}
                  key={affiliation.id}
                  href={affiliation.link ?? undefined}
                >
                  {affiliation.affiliation}
                </a>
              ),
            )
          )}
          {editor ? (
            <Button type="button" onClick={() => show(true)}>
              Create new affiliation
            </Button>
          ) : null}
        </div>
        <div {...stylex.props(css.socialContainer)}>
          {editor ? (
            <div {...stylex.props(styles.disabledSection)}>{links}</div>
          ) : (
            links
          )}
        </div>
      </div>
    </footer>
  );
}
