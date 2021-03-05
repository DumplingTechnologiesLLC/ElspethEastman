import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SpottedSection from '../components/SpottedSection';
import SectionTitle from '../components/SectionTitle';
import SecondaryButton from '../components/SecondaryButton';
import YoutubeComponent from '../components/YoutubeComponent';
import ButtonGroup from '../components/ButtonGroup';
import API from '../api';

const TitleButtonPairing = styled.div`
  & ${SecondaryButton} {
    width: auto;
  }
  ${SectionTitle} + ${SecondaryButton} {
    margin-left: 1em;
  }
  ${SecondaryButton} + ${SectionTitle} {
    margin-left: 1em;
  }
`;
const CenteredButtonGroup = styled(ButtonGroup)`
  margin: 0 auto;
  max-width: 400px;
`;
const ProjectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
`;

export const LatestProjects = () => {
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    API.retrieveProjects(currentPage).then((results) => {
      setLoadedProjects(loadedProjects.concat(results));
    });
  }, [currentPage]);
  return (
    <SpottedSection>
      <TitleButtonPairing>
        <SectionTitle>Latest Projects</SectionTitle>
        <SecondaryButton>See all projects</SecondaryButton>
      </TitleButtonPairing>
      <ProjectContainer>
        {loadedProjects.map((project) => (
          <YoutubeComponent
            key={project.src}
            src={project.src}
            title={project.title}
          />
        ))}
      </ProjectContainer>
      <CenteredButtonGroup>
        <SecondaryButton onClick={() => setCurrentPage(currentPage + 1)}>Load more</SecondaryButton>
        <SecondaryButton>See all projects</SecondaryButton>
      </CenteredButtonGroup>
    </SpottedSection>
  );
};

export default LatestProjects;
