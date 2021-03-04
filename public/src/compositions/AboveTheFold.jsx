import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import JumboTitle from '../components/JumboTitle';
import ColoredText from '../components/ColoredText';
import { Column, Row } from '../components/Layout';
import ContentParagraph from '../components/ContentParagraph';
import HeroImage from '../assets/hero.png';
import TheHeroImage from '../components/HeroImage';
import ButtonGroup from '../components/ButtonGroup';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const AboveTheFoldContainer = styled(Row)`
  margin-top: 3em;
  position: relative;
`;
const ImageContainer = styled(Column)`
  display: flex;
  justify-content: flex-end;
`;
const AboveTheFoldButtons = styled(ButtonGroup)`
  margin-top: 2em;
`;
const PageAnchor = styled.span`
  position: absolute;
  top: -200px;
  opacity: 0;
  z-index: -1;
`;

export const AboveTheFold = () => (
  <AboveTheFoldContainer>
    <Column columnCount={2}>
      <PageAnchor id="PageStart" />
      <JumboTitle id="PageTitle" shadowText="EASTMAN">
        HI, I&apos;M
        {' '}
        <ColoredText flavor="pink">ELSPETH!</ColoredText>
      </JumboTitle>
      <ContentParagraph>
        I&apos;m a voice actor, composer, and gamer.
      </ContentParagraph>
      <ContentParagraph>
        You can hear me as Tristana in League of Legends, Cadence in Crypt of the NecroDancer, Lunais in Timespinner,
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
        <PrimaryButton>
          See my work
        </PrimaryButton>
        <SecondaryButton>
          Get in touch
        </SecondaryButton>
      </AboveTheFoldButtons>
    </Column>
    <ImageContainer columnCount={2}>
      <TheHeroImage src={HeroImage} alt="Elspeth Eastman" />
    </ImageContainer>
  </AboveTheFoldContainer>
);

export default AboveTheFold;
