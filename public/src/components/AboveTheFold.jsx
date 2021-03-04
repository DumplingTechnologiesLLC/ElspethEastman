import React from 'react';
// import PropTypes from 'prop-types';
import JumboTitle from './JumboTitle';
import ColoredText from './ColoredText';
import { Column, Row } from './Layout';
import ContentParagraph from './ContentParagraph';
import HeroImage from '../assets/hero.png';
import TheHeroImage from './HeroImage';
import ButtonGroup from './ButtonGroup';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export const AboveTheFold = () => (
  <Row>
    <Column columnCount={2}>
      <JumboTitle shadowText="EASTMAN">
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
      <ButtonGroup separated>
        <PrimaryButton>
          See my work
        </PrimaryButton>
        <SecondaryButton>
          Get in touch
        </SecondaryButton>
      </ButtonGroup>
    </Column>
    <Column columnCount={2}>
      <TheHeroImage src={HeroImage} alt="Elspeth Eastman" />
    </Column>
  </Row>
);

export default AboveTheFold;
