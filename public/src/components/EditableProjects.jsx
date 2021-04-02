import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { TitleButtonPairing } from './Buttons/ButtonGroup';
import PrimaryButton from './Buttons/PrimaryButton';
import EditableYoutubeComponent from './EditableYoutubeComponent';
import FailedToLoad from './FailedToLoad';
import { WrappedCenteredContent } from './Layout/PageLayout';
import SpottedSection from './Layout/SpottedSection';
import SectionTitle from './Text/SectionTitle';
import { ToastContext } from './ToastManager';

export const EditableProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
  const handleChange = (value, key, index) => {
    const updatedProjects = loadedProjects.slice();
    updatedProjects[index][key] = value;
    setLoadedProjects(updatedProjects);
  };
  return (
    <SpottedSection>
      <TitleButtonPairing>
        <SectionTitle>All Projects</SectionTitle>
        <PrimaryButton>
          Save All
          {' '}
          <FontAwesomeIcon icon={faSave} />
        </PrimaryButton>
      </TitleButtonPairing>
      <WrappedCenteredContent>
        {loadedProjects.map((project, index) => (
          <EditableYoutubeComponent
            onSrcChange={(value) => handleChange(value, 'src', index)}
            onTitleChange={(value) => handleChange(value, 'title', index)}
            key={project.id}
            src={project.src}
            title={project.title}
          />
        ))}
        {loadedProjects.length === 0 && loaded ? (
          <FailedToLoad />
        ) : ''}
      </WrappedCenteredContent>
    </SpottedSection>
  );
};

export default EditableProjects;
