import React, { useState, useEffect } from 'react';
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

export const YoutubeComponent = ({ src, title }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  return (
    <ComponentContainer>
      <VideoTitle title={title} />
      { videoLoaded ? 'TODO' : (
        <VideoThumbnail
          aria-roledescription="Button for loading video"
          src={`https://img.youtube.com/vi/${src}/mqdefault.jpg`}
          alt={`Select this thumbnail to load ${title}`}
          onClick={() => setVideoLoaded(true)}
          onKeyUp={(e) => (e.key === 'Enter' ? setVideoLoaded(true) : null)}
        />
      )}
    </ComponentContainer>
  );
};
YoutubeComponent.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default YoutubeComponent;
