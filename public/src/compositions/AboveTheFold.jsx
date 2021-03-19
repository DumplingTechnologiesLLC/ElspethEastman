import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import JumboTitle from '../components/Text/JumboTitle';
import ColoredText from '../components/Text/ColoredText';
import { Column, Row } from '../components/Layout/Layout';
import ContentParagraph from '../components/Text/ContentParagraph';
import HeroImage from '../assets/hero.webp';
import TheHeroImage from '../components/HeroImage';
import ButtonGroup from '../components/Buttons/ButtonGroup';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import SecondaryButton from '../components/Buttons/SecondaryButton';

const AboveTheFoldContainer = styled(Row)`
  margin-top: 3em;
  position: relative;
`;
const ImageContainer = styled(Column)`
  ${
  (props) => css`
      display: flex;
      justify-content: flex-end;
      @media screen and (max-width: ${props.theme.breakpoints.heroMedium}) {
        justify-content: center;
      }  
    `
}
`;
const TextContainer = styled(Column)`
  display: flex;
  ${
  (props) => css`
      @media screen and (max-width: ${props.theme.breakpoints.heroMedium}) {
        min-width: 520px;
      }
      @media screen and (max-width: ${props.theme.breakpoints.heroSmall}) {
        min-width: 320px;
      }
    `
}
`;
const AboveTheFoldButtons = styled(ButtonGroup)`
  ${(props) => css`
    margin-top: ${props.theme.spacing.xl};
  
  `}
`;
const PageAnchor = styled.span`
  position: absolute;
  top: -200px;
  opacity: 0;
  z-index: -1;
`;

const ContentContainer = styled.div``;

export const AboveTheFold = ({ onGetInTouch }) => {
  const scrollToWork = () => {
    const el = document.querySelector('#latestProjects');
    el ? el.scrollIntoView({
      behavior: 'smooth',
    }) : window.location = '#latestProjects';
  };
  return (
    <AboveTheFoldContainer>
      <TextContainer columnCount={2}>
        <PageAnchor tabIndex="-1" aria-hidden id="PageStart" />
        <ContentContainer>
          <JumboTitle id="PageTitle" shadowText="EASTMAN">
            HI, I&apos;M
            {' '}
            <ColoredText flavor="pink">ELSPETH!</ColoredText>
          </JumboTitle>
          <ContentParagraph>
            I&apos;m a voice actor, composer, and gamer.
          </ContentParagraph>
          <ContentParagraph>
            You can hear me as Tristana in League of Legends,
            Cadence in Crypt of the NecroDancer, Lunais in Timespinner,
            and various music videos! I’m also the host of my own show on Twitch and Youtube, where I stream/record even
            more voice junk on camera.
          </ContentParagraph>
          <ContentParagraph>
            I love meeting new people and undertaking new projects!
          </ContentParagraph>
          <ContentParagraph>
            Let’s do lunch, because lunch is tasty.
          </ContentParagraph>
          <AboveTheFoldButtons separated>
            <PrimaryButton
              onKeyUp={(e) => (e.key === 'Enter' ? scrollToWork() : null)}
              onClick={scrollToWork}
            >
              See my work
            </PrimaryButton>
            <SecondaryButton
              onClick={() => onGetInTouch(true)}
              onKeyUp={(e) => (e.key === 'Enter' ? onGetInTouch(true) : null)}
            >
              Get in touch
            </SecondaryButton>
          </AboveTheFoldButtons>
        </ContentContainer>
      </TextContainer>
      <ImageContainer columnCount={2}>
        <TheHeroImage src={HeroImage} alt="Elspeth Eastman" />
      </ImageContainer>
    </AboveTheFoldContainer>
  );
};

AboveTheFold.propTypes = {
  onGetInTouch: PropTypes.func.isRequired,
};

export default AboveTheFold;
