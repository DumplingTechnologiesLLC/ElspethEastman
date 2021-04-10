import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ToastContext } from '@Components/ToastManager';
import YoutubeComponent from '@Components/YoutubeComponent';
import SectionTitle from '@Components/Text/SectionTitle';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import API from '../api';

export const AllProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const history = useHistory();

  useEffect(() => {
    API.retrieveProjects().then((results) => {
      setLoaded(true);
      if (results === null) {
        toast(
          'Error',
          'Failed to load projects',
          flavors.error,
        );
      } else {
        setLoadedProjects(loadedProjects.concat(results));
      }
    }).catch(() => {
      setLoaded(true);
      toast(
        'Error',
        'Failed to load projects',
        flavors.error,
      );
    });
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
