import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SpottedSection from '../components/Layout/SpottedSection';
import SectionTitle from '../components/Text/SectionTitle';
import SecondaryButton from '../components/Buttons/SecondaryButton';
import YoutubeComponent from '../components/YoutubeComponent';
import ButtonGroup from '../components/Buttons/ButtonGroup';
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
  /**
   * Disabled because we don't really care about loadedProjects here being stale at the time of useEffect since it
   * gets clobbered regardless, and the only thing we are interested in watching is currentPage which tells us when
   * to reload the page.
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    API.retrieveProjects(currentPage).then((results) => {
      setLoadedProjects(loadedProjects.concat(results));
    });
  }, [currentPage]);
  /* eslint-enable react-hooks/exhaustive-deps */
  return (
    <SpottedSection>
      <TitleButtonPairing>
        <SectionTitle id="latestProjects">Latest Projects</SectionTitle>
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
