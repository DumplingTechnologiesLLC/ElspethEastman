import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const StyledTitle = styled.span`
  ${(props) => css`
    ${props.theme.text.youtubeTitle}
  `}
`;
const TitleLine = styled.div`
  height: 2px;
  & + ${StyledTitle} {
    margin-left: .5em;
  }
  ${StyledTitle} + & {
    margin-left: .5em;
  }
  border-radius: 8px;
  flex: 1;
  ${(props) => css`
    background-color: ${props.theme.flavors.pink}
  `}
`;
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;
const VideoTitle = ({ title }) => (
  <TitleContainer>
    <TitleLine />
    <StyledTitle>{title}</StyledTitle>
    <TitleLine />
  </TitleContainer>
);
VideoTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

const VideoThumbnail = styled.img`
  ${(props) => css`
    max-width: 480px;
    width: 100%;
    cursor: pointer;
    margin-top: 1em;
    
    position: relative;
    ${props.theme.mixins.imageLoadingText('Loading', props.theme.flavors.pink, props.theme.flavors.pink)}
  `}
`;
const ComponentContainer = styled.div`
  margin-bottom: 2em;
  width: 480px;
`;
const StyledIframe = styled.iframe`
  margin-top: 1em;
  height: 270px;
  width: 100%;
`;
const VideoThumbnailContainer = styled.div`
  position: relative;
`;
const StyledSVGContainer = styled.div`
  cursor: pointer;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
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
const StyledSVG = styled.svg`
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
export const YoutubeComponent = ({ src, title }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  return (
    <ComponentContainer>
      <VideoTitle title={title} />
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
              onClick={() => setVideoLoaded(true)}
              onKeyUp={(e) => (e.key === 'Enter' ? setVideoLoaded(true) : null)}
              tabIndex="0"
            >
              <StyledSVG viewBox="0 0 128 128">
                <g>
                  <rect
                    clipRule="evenodd"
                    fill="white"
                    fillRule="evenodd"
                    height="60"
                    width="65"
                    transform="translate(20 20)"
                  />
                  <path
                    clipRule="evenodd"
                    d="M126.72,38.224c0,0-1.252-8.883-5.088-12.794    c-4.868-5.136-10.324-5.16-12.824-5.458c-17.912-1.305-44.78-1.305-44.78-1.305h-0.056c0,0-26.868,0-44.78,1.305    c-2.504,0.298-7.956,0.322-12.828,5.458C2.528,29.342,1.28,38.224,1.28,38.224S0,48.658,0,59.087v9.781    c0,10.433,1.28,20.863,1.28,20.863s1.248,8.883,5.084,12.794c4.872,5.136,11.268,4.975,14.116,5.511    c10.24,0.991,43.52,1.297,43.52,1.297s26.896-0.04,44.808-1.345c2.5-0.302,7.956-0.326,12.824-5.462    c3.836-3.912,5.088-12.794,5.088-12.794S128,79.302,128,68.868v-9.781C128,48.658,126.72,38.224,126.72,38.224z M50.784,80.72    L50.78,44.501l34.584,18.172L50.784,80.72z"
                    fill="black"
                    fillRule="evenodd"
                  />
                </g>
              </StyledSVG>
            </StyledSVGContainer>
            <VideoThumbnail
              aria-roledescription="Button for loading video"
              src={`https://img.youtube.com/vi/${src}/mqdefault.jpg`}
              alt={`Select this thumbnail to load ${title}`}
              onClick={() => setVideoLoaded(true)}
              onKeyUp={(e) => (e.key === 'Enter' ? setVideoLoaded(true) : null)}
            />
          </VideoThumbnailContainer>
        )}
    </ComponentContainer>
  );
};
YoutubeComponent.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default YoutubeComponent;
