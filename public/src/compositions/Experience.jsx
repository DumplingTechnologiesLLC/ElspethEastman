import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import SectionTitle from '../components/Text/SectionTitle';
import API from '../api';
import ContentParagraph from '../components/Text/ContentParagraph';
import SectionTitleUnderText from '../components/Text/SectionTitleUnderText';

const ExperienceContainer = styled.section`
  ${(props) => css`
    margin-top: ${props.theme.spacing.jumbo};  
  `}
`;

const ColoredSection = styled.div`
  flex: 1;
  ${(props) => css`
    padding: ${props.theme.spacing.md};
    background-color: ${props.theme.flavors[props.color] ?? props.theme.flavors.background};
  `}
`;
const Row = styled.div`
  display: flex;
  min-width: 100%;
  flex-wrap: wrap;
`;
const Column = styled.div`
  flex: 1;
  min-width: max(50%, 300px);
  display: flex;
  flex-direction: column;
`;

const ColoredTitle = styled.h3`
  ${(props) => css`
    ${props.theme.text.categoryTitle};
    color: ${props.theme.flavors[props.color] ?? 'black'};
  `}
`;

const ExperienceLine = styled(ContentParagraph)`
  ${(props) => css`
    ${props.theme.text.mediumContentText}
  `}
`;

export const Experience = () => {
  const [experience, setExperience] = useState({});
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const lookup = {
    voiceCredits: 'Voice Credits',
    musicGames: 'Music - Games',
    musicMiscellaneous: 'Music - Miscellaneous',
    streamingCredits: 'Streaming Credits',
  };
  const formatCredit = (credit) => (credit.year ? `(${credit.year}) ${credit.credit}` : credit.credit);

  /* eslint-disable no-confusing-arrow */
  const showExperience = (experiences) => experiences?.length ? experiences.map((exp) => (
    <ExperienceLine>
      {formatCredit(exp)}
    </ExperienceLine>
  )) : <ExperienceLine>Coming soon!</ExperienceLine>;

  useEffect(() => {
    if (!experienceLoaded) {
      API.retrieveExperience().then((results) => {
        setExperience(results);
        setExperienceLoaded(true);
      });
    }
  }, [experienceLoaded]);
  const year = new Date().getFullYear();
  return (
    <ExperienceContainer>
      <SectionTitle id="Experience">
        Experience
        <br />
        {' '}
        <SectionTitleUnderText>
          2012 -
          {year}
        </SectionTitleUnderText>
      </SectionTitle>
      <Row>
        <Column>
          <ColoredSection color="bgBlue">
            <ColoredTitle color="textBlue">{lookup.voiceCredits}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.voiceCredits])
              : <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgYellow">
            <ColoredTitle color="textYellow">{lookup.musicGames}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.musicGames])
              : <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgPink">
            <ColoredTitle color="textPink">{lookup.musicMiscellaneous}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.musicMiscellaneous])
              : <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgGreen">
            <ColoredTitle color="textGreen">{lookup.streamingCredits}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.streamingCredits])
              : <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
      </Row>
    </ExperienceContainer>
  );
};

export default Experience;
