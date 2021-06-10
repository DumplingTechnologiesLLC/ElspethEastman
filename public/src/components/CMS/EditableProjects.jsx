import { faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useContext } from 'react';
import ButtonGroup, { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import EditableYoutubeComponent from '@Components/CMS/EditableYoutubeComponent';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import SpottedSection from '@Components/Layout/SpottedSection';
import SectionTitle from '@Components/Text/SectionTitle';
import { ToastContext } from '@Components/ToastManager';
import API from '@App/api';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import Modal from '@Components/Modal/Modal';

export const EditableProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [cachedProjects, setCachedProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [inFlight, setInFlight] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const defaultNewProject = { id: -1, src: '', title: '' };
  const [newProject, setNewProject] = useState(defaultNewProject);
  const toastMap = {
    404: {
      flavor: flavors.error,
      title: 'Error',
      content: 'Project no longer exists. Perhaps it was already deleted?',
    },
    400: {
      flavor: flavors.error,
      title: 'Error',
      content: 'There was a problem with your submission',
    },
    200: {
      flavor: flavors.success,
      title: 'Success',
      content: 'Action submitted successfully.',
    },
  };

  /**
   * API consumers
   */

  const deleteProject = async (index) => {
    const projectToBeDeleted = loadedProjects[index];
    setInFlight([...inFlight, projectToBeDeleted.id]);
    const response = await API.deleteProject(projectToBeDeleted.id);
    setInFlight(inFlight.filter((id) => id !== projectToBeDeleted.id));
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
    if (response.status === 200) {
      const newLoadedProjects = loadedProjects.slice();
      newLoadedProjects.splice(index, 1);
      setLoadedProjects(newLoadedProjects);
      setCachedProjects(JSON.parse(JSON.stringify(newLoadedProjects)));
    }
  };

  const updateProject = async (index) => {
    const projectToSubmit = loadedProjects[index];
    setInFlight([...inFlight, projectToSubmit.id]);
    const response = await API.updateProject(projectToSubmit, projectToSubmit.id);
    setInFlight(inFlight.filter((id) => id !== projectToSubmit.id));
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
      setErrors({ ...errors, [projectToSubmit.id]: response.data });
    }
    const newCachedProjects = cachedProjects.slice();
    newCachedProjects[index] = { ...projectToSubmit };
    setCachedProjects(newCachedProjects);
  };

  const createProject = async () => {
    const data = { src: newProject.src, title: newProject.title };
    setInFlight([...inFlight, newProject.id]);
    const response = await API.createProject(data);
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
    setInFlight(inFlight.filter((inFlightId) => inFlightId !== newProject.id));
    if (response.status === 400) {
      setErrors({ ...errors, [response.data.id]: response.data.errors });
    } else {
      setLoadedProjects([...loadedProjects, { ...response.data.project }]);
      setCachedProjects([...JSON.parse(JSON.stringify(loadedProjects)), { ...response.data.project }]);
      setShowModal(false);
      setNewProject(defaultNewProject);
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
    setCachedProjects(loadedProjects);
    if (response.status === 400) {
      setErrors({ ...errors, [response.data.id]: response.data.errors });
    }
    setInFlight(inFlight.filter((inFlightId) => inFlightId !== response.data.id));
  };

  useEffect(() => {
    if (!projectsLoaded) {
      API.retrieveProjects().then((results) => {
        setLoaded(true);
        if (results === null) {
          toast(
            'Error',
            'Failed to load projects',
            flavors.error,
          );
        } else {
          setLoadedProjects(loadedProjects.concat(results.slice()));
          setCachedProjects(cachedProjects.concat(JSON.parse(JSON.stringify(results.slice()))));
        }
      }).catch(() => {
        setLoaded(true);
        toast(
          'Error',
          'Failed to load projects',
          flavors.error,
        );
      }).finally(() => {
        setProjectsLoaded(true);
      });
    }
    /**
     * We don't care about this hook firing every time toast references change. Not important.
     */
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [projectsLoaded]);

  const updateProjectData = (project, value, key) => {
    /**
     * Disabled because we know want to mutate the object here
     */
    /* eslint-disable no-param-reassign */
    if (key === 'src') {
      // we need to strip everything that's not the value.
      const embedString = 'embed/';
      const watchString = 'watch?v=';
      if (value.includes(embedString)) {
        // embed url in the format youtube.com/embed/<id>

        value = value.slice(value.indexOf(embedString) + embedString.length);
      } else if (value.includes(watchString)) {
        value = value.slice(value.indexOf(watchString) + watchString.length);
        if (value.includes('&')) {
          value = value.slice(0, value.indexOf('&'));
        }
      }
    }
    project[key] = value;
    /* eslint-enable no-param-reassign */
  };

  /**
   * Form function
   */

  const resetProject = (index) => {
    const currentLoadedProjects = loadedProjects.slice();
    currentLoadedProjects[index] = { ...cachedProjects[index] };
    setLoadedProjects(currentLoadedProjects);
  };

  const handleNewProjectChange = (value, key) => {
    const changedProject = { ...newProject };
    updateProjectData(changedProject, value, key);
    setNewProject(changedProject);
  };

  const handleChange = (value, key, index) => {
    const updatedProjects = loadedProjects.slice();
    const project = updatedProjects[index];
    updateProjectData(project, value, key);
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
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title={
          <span>Add new Project</span>
      }
        content={(
          <EditableYoutubeComponent
            onSrcChange={(value) => handleNewProjectChange(value, 'src')}
            onTitleChange={(value) => handleNewProjectChange(value, 'title')}
            onSubmit={createProject}
            onReset={() => setNewProject(defaultNewProject)}
            errors={errors[newProject.id] ?? {}}
            inFlight={inFlight.includes(newProject.id)}
            src={newProject.src}
            title={newProject.title}
            block
            showDelete={false}
          />
        )}
      />
      <TitleButtonPairing>
        <SectionTitle>All Projects</SectionTitle>
        <ButtonGroup>
          <PrimaryButton onClick={updateAllProjects}>
            Save All
            {' '}
            <FontAwesomeIcon icon={faSave} />
          </PrimaryButton>
          <SecondaryButton onClick={() => setShowModal(true)}>
            Add New Project
            {' '}
            <FontAwesomeIcon icon={faPlus} />
          </SecondaryButton>
        </ButtonGroup>
      </TitleButtonPairing>
      <WrappedCenteredContent>
        {loadedProjects.map((project, index) => (
          <EditableYoutubeComponent
            onSrcChange={(value) => handleChange(value, 'src', index)}
            onTitleChange={(value) => handleChange(value, 'title', index)}
            onDelete={() => deleteProject(index)}
            onSubmit={() => updateProject(index)}
            onReset={() => resetProject(index)}
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
