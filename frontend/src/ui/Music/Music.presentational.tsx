import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import BackgroundElephant from '../../assets/svg/BackgroundElephant.svg';
import { Title } from '../Primitives.presentational';
import { styles } from '../styles';
const css = stylex.create({
  container: {
    position: 'relative',
    minHeight: 650,
    overflow: 'hidden',
    padding: '8em 2em 0',
  },
  decoration: {
    backgroundImage: 'linear-gradient(#01d1fe, white)',
    height: '100%',
    position: 'absolute',
    opacity: 0.1,
    pointerEvents: 'none',
    zIndex: 0,
    width: '200%',
    transform: 'rotate(5deg)',
    top: 145,
    left: -201,
  },
  image: {
    zIndex: 0,
    position: 'absolute',
    right: '-17%',
    height: '60%',
    pointerEvents: 'none',
    top: '40%',
  },
  frameContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
    justifyContent: 'center',
  },
  frame: {
    margin: '0 auto',
    maxWidth: 500,
    zIndex: 1,
    backgroundColor: 'white',
    borderWidth: 0,
  },
  placeholder: {
    margin: '0 auto',
    maxWidth: 500,
    maxHeight: 500,
    height: 500,
    width: '100%',
    zIndex: 1,
    backgroundColor: '#b6ecf7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1em',
    borderWidth: 0,
  },
  loading: { margin: 0 },
});
export function Music() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section {...stylex.props(css.container)}>
      <div {...stylex.props(css.decoration)} id="Music" />
      <img
        {...stylex.props(css.image)}
        src={BackgroundElephant}
        aria-hidden
        tabIndex={-1}
      />
      <Title>Music </Title>
      <div {...stylex.props(css.frameContainer)}>
        {ready ? (
          <iframe
            {...stylex.props(css.frame)}
            title="My soundcloud"
            tabIndex={-1}
            width="100%"
            height="500"
            frameBorder="no"
            scrolling="no"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/2775113&color=ff9bff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false"
          />
        ) : (
          <div {...stylex.props(css.placeholder)}>
            <h2 {...stylex.props(styles.title, css.loading)}>
              Loading Soundcloud...
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}
