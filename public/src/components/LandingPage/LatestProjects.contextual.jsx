import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import SpottedSection from '@Components/Layout/SpottedSection';
import SectionTitle from '@Components/Text/SectionTitle';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import YoutubeComponent from '@Components/LandingPage/YoutubeComponent';
import ButtonGroup, { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import { ToastContext, DEFAULT_ERROR_MESSAGE_TITLE } from '@Components/ToastManager';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import API from '@App/api';
import routes from '@App/router/routes';
import { HTTP_NETWORK_ERROR, HTTP_SERVER_ERROR } from '@App/api/utils';

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
    const fetchPaginatedProjects = async (page) => {
      setLoaded(true);
      const response = await API.retrievePaginatedProjects(page);
      if ([HTTP_NETWORK_ERROR, HTTP_SERVER_ERROR].some((status) => status === response.status)) {
        toast(
          DEFAULT_ERROR_MESSAGE_TITLE,
          'Failed to load next page of projects',
          flavors.error,
        );
      } else {
        setLoadedProjects(loadedProjects.concat(response.data.data));
        setTotalPages(response.data.pages);
      }
    };
    fetchPaginatedProjects(currentPage);
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
