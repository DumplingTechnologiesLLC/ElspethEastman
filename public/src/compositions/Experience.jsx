import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import SectionTitle from '../components/Text/SectionTitle';
import API from '../api';
import ContentParagraph from '../components/Text/ContentParagraph';
import SectionTitleUnderText from '../components/Text/SectionTitleUnderText';

const ExperienceContainer = styled.section`
  margin-top: 10em;
`;

const ColoredSection = styled.div`
  flex: 1;
  padding: 1em;
  ${(props) => css`
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
  const formatCredit = (credit) => (credit.year ? `(${credit.year}) ${credit.credit}` : credit.credit);

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
            <ColoredTitle color="textBlue">Voice Credits</ColoredTitle>
            {experience['Voice Credits']?.map((exp) => (
              <ExperienceLine key={exp.id}>
                {formatCredit(exp)}
              </ExperienceLine>
            )) ?? <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgYellow">
            <ColoredTitle color="textYellow">Music - Games</ColoredTitle>
            {experience['Music - Games']?.map((exp) => (
              <ExperienceLine>
                {formatCredit(exp)}
              </ExperienceLine>
            )) ?? <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
          <ColoredSection color="bgPink">
            <ColoredTitle color="textPink">Music - Miscellaneous</ColoredTitle>
            {experience['Music - Miscellaneous']?.map((exp) => (
              <ExperienceLine>
                {formatCredit(exp)}
              </ExperienceLine>
            )) ?? <ExperienceLine>Loading</ExperienceLine>}
          </ColoredSection>
        </Column>
      </Row>
    </ExperienceContainer>
  );
};

export default Experience;
