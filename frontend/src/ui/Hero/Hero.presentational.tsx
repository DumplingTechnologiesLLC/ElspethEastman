import * as stylex from '@stylexjs/stylex';
import HeroImage from '../../assets/hero2.webp';
import { Button, Paragraph } from '../Primitives.presentational';
import { styles } from '../styles';
const css = stylex.create({
  container: { marginTop: '3em', position: 'relative' },
  text: {
    display: 'flex',
    minWidth: {
      default: 0,
      '@media (max-width: 1080px)': 520,
      '@media (max-width: 580px)': 320,
    },
  },
  imageColumn: {
    display: 'flex',
    justifyContent: {
      default: 'flex-end',
      '@media (max-width: 1080px)': 'center',
    },
  },
  image: {
    height: {
      default: 500,
      '@media (max-width: 1080px)': 400,
      '@media (max-width: 580px)': 300,
    },
    marginTop: { default: 0, '@media (max-width: 1080px)': '2em' },
  },
  anchor: { position: 'absolute', top: -200, opacity: 0, zIndex: -1 },
  jumbo: {
    zIndex: 0,
    fontSize: 50,
    position: 'relative',
    '::after': {
      content: '"EASTMAN"',
      position: 'absolute',
      left: 0,
      bottom: { default: 0, '@media (max-width: 580px)': 10 },
      fontSize: { default: 95, '@media (max-width: 580px)': 68 },
      color: 'rgba(0,0,0,.05)',
      zIndex: -1,
      display: { default: 'block', '@media (max-width: 420px)': 'none' },
    },
  },
  pink: { color: '#e300b3' },
  buttons: { marginTop: '2em' },
});
export interface HeroProps {
  onContact: () => void;
}
const scrollToWork = () =>
  document
    .querySelector('#latestProjects')!
    .scrollIntoView({ behavior: 'smooth' });
export function Hero({ onContact }: HeroProps) {
  return (
    <div {...stylex.props(styles.row, css.container)}>
      <div {...stylex.props(styles.column, css.text)}>
        <span
          {...stylex.props(css.anchor)}
          tabIndex={-1}
          aria-hidden
          id="PageStart"
        />
        <div>
          <h1 {...stylex.props(styles.title, css.jumbo)} id="PageTitle">
            HI, I&apos;M <span {...stylex.props(css.pink)}>ELSPETH!</span>
          </h1>
          <Paragraph>I&apos;m a voice actor, composer, and gamer.</Paragraph>
          <Paragraph>
            You can hear me as Tristana in League of Legends, Cadence in Crypt
            of the NecroDancer, Lunais in Timespinner, and various music videos!
            I’m also the host of my own show on Twitch and Youtube, where I
            stream/record even more voice junk on camera.
          </Paragraph>
          <Paragraph>
            I love meeting new people and undertaking new projects!
          </Paragraph>
          <Paragraph>Let’s do lunch, because lunch is tasty.</Paragraph>
          <div {...stylex.props(styles.buttonRow, css.buttons)}>
            <Button
              onKeyUp={(event) => {
                if (event.key === 'Enter') scrollToWork();
              }}
              onClick={scrollToWork}
            >
              See my work
            </Button>
            <Button
              variant="secondary"
              {...stylex.props(
                styles.button,
                styles.secondary,
                styles.separated,
              )}
              onClick={onContact}
              onKeyUp={(event) => {
                if (event.key === 'Enter') onContact();
              }}
            >
              Get in touch
            </Button>
          </div>
        </div>
      </div>
      <div {...stylex.props(styles.column, css.imageColumn)}>
        <img
          {...stylex.props(css.image)}
          src={HeroImage}
          alt="Elspeth Eastman"
        />
      </div>
    </div>
  );
}
