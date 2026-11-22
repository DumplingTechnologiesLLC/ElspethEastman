import * as stylex from '@stylexjs/stylex';
import type { WorkEntryView } from '../../application/viewModels/WorkEntryView';
import { ActionLink, IconButton } from '../Controls/Controls.presentational';
import { Editable } from '../Editable/Editable.presentational';
import { tokens } from '../tokens.stylex';
import closeIcon from '../../assets/design/close.svg';
const css = stylex.create({
  detail: { backgroundColor: tokens.canvas, color: tokens.foreground },
  hero: {
    position: 'relative',
    aspectRatio: { default: '1.48', '@media (max-width: 760px)': '5 / 7' },
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(180deg,rgba(5,5,5,.08) 0%,rgba(5,5,5,.2) 42%,rgba(5,5,5,.95) 100%),linear-gradient(90deg,rgba(5,5,5,.25),transparent 62%)',
  },
  heading: {
    position: 'absolute',
    insetInline: { default: 40, '@media (max-width: 760px)': 20 },
    bottom: { default: 30, '@media (max-width: 760px)': 22 },
  },
  eyebrow: {
    fontFamily: tokens.sans,
    fontSize: 10.88,
    letterSpacing: '1.74px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  title: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: { default: 82, '@media (max-width: 760px)': 63 },
    lineHeight: { default: 1, '@media (max-width: 760px)': '65px' },
    letterSpacing: '-.03em',
    marginTop: { default: 8, '@media (max-width: 760px)': 4 },
    marginBottom: 0,
  },
  close: { position: 'absolute', top: 18, right: 18 },
  body: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0,1.35fr) minmax(0,1fr)',
      '@media (max-width: 760px)': 'minmax(0,1fr)',
    },
    gap: { default: 54, '@media (max-width: 760px)': 24 },
    paddingBlock: 30,
    paddingInline: { default: 40, '@media (max-width: 760px)': 20 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
  },
  description: {
    fontFamily: tokens.serif,
    fontSize: 18.88,
    lineHeight: 1.5,
    whiteSpace: 'pre-line',
    color: '#c1bbb3',
    margin: 0,
  },
  metadata: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
    alignItems: 'start',
    gap: 20,
  },
  fact: {
    margin: 0,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 10,
  },
  label: {
    fontFamily: tokens.sans,
    fontSize: 10,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: tokens.secondary,
    marginBottom: 5,
  },
  value: {
    fontFamily: tokens.sans,
    fontSize: 13,
    lineHeight: 1.45,
    color: tokens.foreground,
    margin: 0,
  },
  caption: {
    fontFamily: tokens.sans,
    fontSize: 11,
    color: tokens.secondary,
    margin: 0,
    paddingBlock: 8,
    paddingInline: { default: 40, '@media (max-width: 760px)': 20 },
  },
});
export function WorkDetail({
  entry,
  onClose,
}: {
  readonly entry: WorkEntryView;
  readonly onClose: () => void;
}) {
  return (
    <Editable actions={entry.actions} label={entry.title} placement="inside">
      <article {...stylex.props(css.detail)}>
        <div {...stylex.props(css.hero)}>
          {entry.image !== null && (
            <img
              {...stylex.props(css.image)}
              src={entry.image.url}
              alt={entry.image.altText}
              fetchPriority="high"
            />
          )}
          <div {...stylex.props(css.overlay)} />
          <div {...stylex.props(css.heading)}>
            <p {...stylex.props(css.eyebrow)}>{entry.eyebrow}</p>
            <h2 {...stylex.props(css.title)}>{entry.title}</h2>
          </div>
          <div {...stylex.props(css.close)}>
            <IconButton aria-label="Close detail" onClick={onClose}>
              <img src={closeIcon} alt="" />
            </IconButton>
          </div>
        </div>
        {entry.image !== null && entry.image.caption !== '' && (
          <p {...stylex.props(css.caption)}>{entry.image.caption}</p>
        )}
        <div {...stylex.props(css.body)}>
          <p {...stylex.props(css.description)}>{entry.description}</p>
          <div {...stylex.props(css.metadata)}>
            {entry.publication !== null && (
              <dl {...stylex.props(css.fact)}>
                <dt {...stylex.props(css.label)}>Published</dt>
                <dd {...stylex.props(css.value)}>{entry.publication}</dd>
              </dl>
            )}
            {entry.metadata.map((item) => (
              <dl key={item.key} {...stylex.props(css.fact)}>
                <dt {...stylex.props(css.label)}>{item.label}</dt>
                <dd {...stylex.props(css.value)}>{item.value}</dd>
              </dl>
            ))}
            {entry.action !== null && (
              <ActionLink
                href={entry.action.href}
                external={entry.action.isExternal}
              >
                {entry.action.label}
              </ActionLink>
            )}
          </div>
        </div>
      </article>
    </Editable>
  );
}
