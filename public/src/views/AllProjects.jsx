import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ToastContext, DEFAULT_ERROR_MESSAGE_TITLE } from '@Components/ToastManager';
import YoutubeComponent from '@Components/LandingPage/YoutubeComponent';
import SectionTitle from '@Components/Text/SectionTitle';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import { performAPIAction, HTTP_SUCCESS } from '@App/api/utils';
import API from '../api';

export const AllProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await performAPIAction(API.retrieveProjects, null, null, toast);

      setLoaded(true);
      if (response.status === HTTP_SUCCESS) {
        setLoadedProjects(loadedProjects.concat(response.data));
      } else {
        toast(
          DEFAULT_ERROR_MESSAGE_TITLE,
          'Failed to load projects',
          flavors.error,
        );
      }
    };
    fetchProjects();
  /**
   * We don't care about this hook firing every time toast references change. Not important.
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
  return (
    <>
      <TitleButtonPairing>
        <SectionTitle>All Projects</SectionTitle>
        <SecondaryButton onClick={() => history.push('/')}>Go back</SecondaryButton>
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
    </>
  );
};

export default AllProjects;
