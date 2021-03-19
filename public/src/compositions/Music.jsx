import React from 'react';
import styled, { css } from 'styled-components';
import SectionTitle from '../components/Text/SectionTitle';
import BackgroundElephant from '../assets/svg/BackgroundElephant.svg';

const MusicContainer = styled.section`
  ${(props) => css`
    position: relative;
    min-height: 650px;
    overflow: hidden;
    padding:  8em ${props.theme.spacing.xl} 0 ${props.theme.spacing.xl};
  `}
`;
const BackgroundDecoration = styled.div`
  ${(props) => css`
    background: linear-gradient(${props.theme.flavors.blue}, white);
    height: 100%;
    position: absolute;
    top: 0;
    opacity: .1;
    pointer-events: none;
    z-index: 0;
    width: 200%;
    transform: rotate(5deg);
    top: 145px;
    left: -201px;
  `}
`;
const BackgroundImage = styled.img`
  z-index: 0;
  position: absolute;
  right: -17%;
  height: 60%;
  pointer-events: none;
  top: 40%;
`;
const IFrameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  justify-content: center;
`;
const StyledIframe = styled.iframe`
  ${(props) => css`
    margin: 0 auto;
    max-width: 500px;
    z-index: 1;
    background-color: white;
    border: 0;
  `}
`;
/* eslint-disable max-len */
export const Music = () => (
  <MusicContainer>
    <BackgroundDecoration id="Music" />
    <BackgroundImage src={BackgroundElephant} aria-hidden tabindex="-1" />
    <SectionTitle>Music </SectionTitle>
    <IFrameContainer>
      <StyledIframe
        title="My soundcloud"
        tabIndex="-1"
        color="black"
        width="100%"
        height="500"
        frameborder="no"
        scrolling="no"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/2775113&color=ff9bff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false"
      />
    </IFrameContainer>

  </MusicContainer>
);

export default Music;
