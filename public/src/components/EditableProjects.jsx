import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useContext } from 'react';
import { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import EditableYoutubeComponent from '@Components/EditableYoutubeComponent';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import SpottedSection from '@Components/Layout/SpottedSection';
import SectionTitle from '@Components/Text/SectionTitle';
import { ToastContext } from '@Components/ToastManager';
import API from '@App/api';

export const EditableProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [inFlight, setInFlight] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const toastMap = {
    404: {
      flavor: flavors.error,
      title: 'Error',
      content: 'Project no longer exists. Perhaps it was deleted?',
    },
    400: {
      flavor: flavors.error,
      title: 'Error',
      content: 'There was a problem with your submission',
    },
    200: {
      flavor: flavors.success,
      title: 'Success',
      content: 'Project updated.',
    },
  };

  const updateProject = async (index) => {
    const systemToSubmit = loadedProjects[index];
    setInFlight([...inFlight, systemToSubmit.id]);
    const response = await API.updateProject(systemToSubmit, systemToSubmit.id);
    setInFlight(inFlight.filter((id) => id !== systemToSubmit.id));
    if (response === null) {
      toast(
        'Error',
        'Network error',
        flavors.error,
      );
      return;
    }
    const { title, content, flavor } = toastMap[response.status];
    toast(
      title,
      content,
      flavor,
    );
    if (response.status === 400) {
      setErrors({ ...errors, [systemToSubmit.id]: response.data });
    }
  };

  const updateAllProjects = async () => {
    const existingErrors = Object.entries(errors).filter(([, value]) => Object.keys(value).length > 0);
    if (existingErrors.length > 0) {
      // unresolved errors
      toast(
        'Error',
        'Please resolve errors before submitting.',
        flavors.error,
      );
      return;
    }
    setInFlight(loadedProjects.map((project) => project.id));
    const response = await API.updateAllProjects(loadedProjects);
    if (response === null) {
      toast(
        'Error',
        'Network error',
        flavors.error,
      );
      return;
    }
    const { title, flavor } = toastMap[response.status];
    toast(
      title,
      response.data.message ?? response.data.error,
      flavor,
    );
    if (response.status === 400) {
      setErrors({ ...errors, [response.data.id]: response.data.errors });
    }
    setInFlight([]);
  };

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
    const existingErrors = errors[updatedProjects[index].id] ?? {};
    if (existingErrors[key]) {
      delete existingErrors[key];
    }
    setErrors({ ...errors, [updatedProjects[index].id]: existingErrors });
    setLoadedProjects(updatedProjects);
  };
  return (
    <SpottedSection>
      <TitleButtonPairing>
        <SectionTitle>All Projects</SectionTitle>
        <PrimaryButton onClick={updateAllProjects}>
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
            onSubmit={() => updateProject(index)}
            errors={errors[project.id] ?? {}}
            inFlight={inFlight.includes(project.id)}
            src={project.src}
            title={project.title}
            key={project.id}
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
