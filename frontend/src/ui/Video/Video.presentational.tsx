import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { PlayIcon } from './PlayIcon.presentational';
const css = stylex.create({
  container: {
    marginBottom: '2em',
    width: '100%',
    minHeight: 368,
    maxWidth: 480,
  },
  block: { maxWidth: '100%' },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  line: { height: 2, borderRadius: 8, flex: 1, backgroundColor: '#ff9bff' },
  title: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    fontSize: '1.25em',
    color: '#292929',
    marginLeft: '.5em',
    marginRight: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: '-1.25em',
  },
  thumbnail: {
    maxWidth: 480,
    width: '100%',
    cursor: 'pointer',
    clipPath: 'inset(13% 0 13% 0)',
    position: 'relative',
  },
  overlay: {
    cursor: 'pointer',
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    height: 80,
    opacity: 0.6,
    zIndex: 1,
    pointerEvents: 'none',
    transition: 'opacity .2s ease-out',
  },
  hover: { opacity: 0.8, fill: '#CE1312' },
  iframe: { marginTop: '1.25em', height: 270, width: 480, maxWidth: '100%' },
});
export interface VideoProps {
  title: string;
  thumbnail: string;
  embed: string;
  block?: boolean;
}
export function Video({ title, thumbnail, embed, block = false }: VideoProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div {...stylex.props(css.container, block && css.block)}>
      <div {...stylex.props(css.titleRow)}>
        <div {...stylex.props(css.line)} />
        <span {...stylex.props(css.title)}>{title}</span>
        <div {...stylex.props(css.line)} />
      </div>
      {loaded ? (
        // oxlint-disable-next-line react/iframe-missing-sandbox -- Preserve the existing media provider capabilities during the tooling migration.
        <iframe
          {...stylex.props(css.iframe)}
          title={`Embedded Youtube Video: ${title}`}
          allowFullScreen
          frameBorder="0"
          src={embed}
        />
      ) : (
        <div {...stylex.props(css.thumbnailContainer)}>
          <div
            {...stylex.props(css.overlay)}
            aria-label={`Video Loader: ${title}`}
            onClick={() => setLoaded(true)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') setLoaded(true);
            }}
            tabIndex={0}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
          >
            <PlayIcon
              hovered={hovered}
              {...stylex.props(css.svg, hovered && css.hover)}
            />
          </div>
          <img
            {...stylex.props(css.thumbnail, block && css.block)}
            tabIndex={-1}
            aria-roledescription="Button for loading video"
            src={thumbnail}
            alt={`Select this thumbnail to load ${title}`}
            onClick={() => setLoaded(true)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') setLoaded(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
