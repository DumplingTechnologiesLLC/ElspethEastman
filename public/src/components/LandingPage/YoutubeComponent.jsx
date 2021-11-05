import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as YoutubeLoader } from '@Assets/svg/YoutubeLoader.svg';

const StyledTitle = styled.span`
  ${(props) => css`
    ${props.theme.text.youtubeTitle};
  `}
`;
const TitleLine = styled.div`
  ${(props) => css`
    height: 2px;
    & + ${StyledTitle} {
      margin-left: ${props.theme.spacing.sm};
    }
    ${StyledTitle} + & {
      margin-left: ${props.theme.spacing.sm};
    }
    border-radius: 8px;
    flex: 1;
    background-color: ${props.theme.flavors.pink};
  `}
`;
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  width: 100%;
  ${({ theme, block }) => css`
    max-width: ${block ? '100%' : theme.videoSize};
  `}
`;
const VideoTitle = ({ title, block }) => (
  <TitleContainer block={block}>
    <TitleLine />
    <StyledTitle>{title}</StyledTitle>
    <TitleLine />
  </TitleContainer>
);
VideoTitle.propTypes = {
  title: PropTypes.string.isRequired,
  block: PropTypes.bool.isRequired,
};

const VideoThumbnail = styled.img`
  ${({ theme, block }) => css`
    max-width: ${block ? '100%' : theme.videoSize};
    width: 100%;
    
    cursor: pointer;
    clip-path: inset(13% 0 13% 0);
    position: relative;
    ${theme.mixins.imageLoadingText('Loading', theme.flavors.pink, theme.flavors.pink)}
  `}
`;
const ComponentContainer = styled.div`
  ${({ theme, block }) => css`
    margin-bottom: ${theme.spacing.xl};
    max-width: ${block ? '100%' : theme.videoSize}
    width: 100%;
    min-height: 368px;
  `}
`;
const StyledIframe = styled.iframe`
  ${(props) => css`
    margin-top: ${props.theme.spacing.lg};
    height: 270px;
    width: 480px;
    max-width: 100%;
  `}
`;
const VideoThumbnailContainer = styled.div`
  position: relative;
  overflow:hidden;
  ${({ theme }) => css`
    margin-top: -1.25em;
  `}
`;
const StyledSVGContainer = styled.div`
  cursor: pointer;
  position: absolute;
  ${(props) => css`
    ${props.theme.fixedOrAbsoluteFullCoverage}
  `}
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover, &:focus {
    svg {
      opacity: .8;
      & path {
        fill: #CE1312;
      }
    }
  }
`;
const StyledSVG = styled(YoutubeLoader)`
 ${(props) => css`
  height: 80px;
  opacity: .6;
  z-index: 1;
  pointer-events: none;
  ${props.theme.mixins.transition(['opacity', '.2s', 'ease-out'])};
  & path {
    ${props.theme.mixins.transition(['fill', '.2s', 'ease-out'])};
  }
 `}
`;
/* eslint-disable max-len */
export const YoutubeComponent = ({ src, title, block }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  return (
    <ComponentContainer block={block}>
      <VideoTitle title={title} block={block} />
      { videoLoaded ? (
        <StyledIframe
          title={`Embedded Youtube Video: ${title}`}
          allowFullScreen
          frameBorder="0"
          src={`https://www.youtube.com/embed/${src}?rel=0&showinfo=0&autoplay=1`}
        />
      )
        : (

          <VideoThumbnailContainer>
            <StyledSVGContainer
              aria-label={`Video Loader: ${title}`}
              onClick={() => setVideoLoaded(true)}
              onKeyUp={(e) => (e.key === 'Enter' ? setVideoLoaded(true) : null)}
              tabIndex="0"
            >
              <StyledSVG />
            </StyledSVGContainer>
            <VideoThumbnail
              tabIndex="-1"
              aria-roledescription="Button for loading video"
              src={`https://img.youtube.com/vi/${src}/hqdefault.jpg`}
              alt={`Select this thumbnail to load ${title}`}
              onClick={() => setVideoLoaded(true)}
              onKeyUp={(e) => (e.key === 'Enter' ? setVideoLoaded(true) : null)}
              block={block}
            />
          </VideoThumbnailContainer>
        )}
    </ComponentContainer>
  );
};
YoutubeComponent.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  block: PropTypes.bool,
};

YoutubeComponent.defaultProps = {
  block: false,
};

export default YoutubeComponent;
