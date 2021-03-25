import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import SpottedSection from './Layout/SpottedSection';
import SectionTitle from './Text/SectionTitle';
import SecondaryButton from './Buttons/SecondaryButton';
import YoutubeComponent from './YoutubeComponent';
import ButtonGroup, { TitleButtonPairing } from './Buttons/ButtonGroup';
import API from '../api';
import { ToastContext } from './ToastManager';
import FailedToLoad from './FailedToLoad';
import { WrappedCenteredContent } from './Layout/PageLayout';
import routes from '../routes';

const CenteredButtonGroup = styled(ButtonGroup)`
  margin: 0 auto;
  max-width: 400px;
`;

export const LatestProjects = () => {
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const [currentPage, setCurrentPage] = useState(1);
  const history = useHistory();
  const [totalPages, setTotalPages] = useState(0);
  /**
   * Disabled because we don't really care about loadedProjects here being stale at the time of useEffect since it
   * gets clobbered regardless, and the only thing we are interested in watching is currentPage which tells us when
   * to reload the page.
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    API.retrievePaginatedProjects(currentPage).then((results) => {
      setLoaded(true);
      if (results === null) {
        toast(
          'Error',
          'Failed to load next page of projects',
          flavors.error,
        );
      } else {
        setLoadedProjects(loadedProjects.concat(results.data));
        setTotalPages(results.pages);
      }
    }).catch(() => {
      setLoaded(true);
      toast(
        'Error',
        'Failed to load next page of projects',
        flavors.error,
      );
    });
  }, [currentPage]);
  /* eslint-enable react-hooks/exhaustive-deps */
  return (
    <SpottedSection>
      <TitleButtonPairing>
        <SectionTitle id="latestProjects">Latest Projects</SectionTitle>
        <SecondaryButton onClick={() => history.push(routes.projects)}>See all projects</SecondaryButton>
      </TitleButtonPairing>
      <WrappedCenteredContent>
        {loadedProjects.map((project) => (
          <YoutubeComponent
            key={project.src}
            src={project.src}
            title={project.title}
          />
        ))}
        {loadedProjects.length === 0 && loaded ? (
          <FailedToLoad />
        ) : ''}
      </WrappedCenteredContent>
      <CenteredButtonGroup>
        <SecondaryButton
          aria-disabled={currentPage >= totalPages}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Load more

        </SecondaryButton>
        <SecondaryButton>See all projects</SecondaryButton>
      </CenteredButtonGroup>
    </SpottedSection>
  );
};

export default LatestProjects;
