import { faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useContext } from 'react';
import ButtonGroup, { TitleButtonPairing } from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import Project from '@Components/CMS/projects/Project';
import FailedToLoad from '@Components/FailedToLoad';
import { WrappedCenteredContent } from '@Components/Layout/PageLayout';
import SpottedSection from '@Components/Layout/SpottedSection';
import SectionTitle from '@Components/Text/SectionTitle';
import { ToastContext, DEFAULT_ERROR_MESSAGE_TITLE } from '@Components/ToastManager';
import API from '@App/api';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import Modal from '@Components/Modal/Modal';
import { cloneDeep, toastMapFactory } from '@App/utils';
import {
  toastBasedOnResponse, performAPIDelete, HTTP_SUCCESS, performAPIAction, HTTP_BAD_SUBMISSION, HTTP_NETWORK_ERROR,
} from '@App/api/utils';

const PROJECTS_FAILED_TO_LOAD = 'Failed to load projects';
const DEFAULT_NEW_PROJECT = { id: -1, src: '', title: '' };

export const EditableProjects = () => {
  const { toast, flavors } = useContext(ToastContext);
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [cachedProjects, setCachedProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [inFlight, setInFlight] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [newProject, setNewProject] = useState(DEFAULT_NEW_PROJECT);
  const toastMap = toastMapFactory('Project no longer exists. Perhaps it was already deleted?');

  /**
   * API consumers
   */

  const deleteProject = async (index) => {
    const projectToBeDeleted = loadedProjects[index];

    setInFlight([...inFlight, projectToBeDeleted.id]);
    const response = await performAPIDelete(API.deleteProject, projectToBeDeleted.id, toast);
    setInFlight(inFlight.filter((id) => id !== projectToBeDeleted.id));

    toastBasedOnResponse(response, toast, toastMap);
    if (response.status === HTTP_SUCCESS) {
      const newLoadedProjects = loadedProjects.slice();
      newLoadedProjects.splice(index, 1);
      setLoadedProjects(newLoadedProjects);
      setCachedProjects(cloneDeep(newLoadedProjects));
    }
  };

  const updateProject = async (index) => {
    const projectToSubmit = loadedProjects[index];

    // clear errors so stale errors go away
    const clearedErrors = cloneDeep(errors);
    delete errors[projectToSubmit.id];
    setErrors(clearedErrors);

    setInFlight([...inFlight, projectToSubmit.id]);
    const response = await performAPIAction(API.updateProject, projectToSubmit, projectToSubmit.id, toast);
    setInFlight(inFlight.filter((id) => id !== projectToSubmit.id));

    toastBasedOnResponse(response, toast, toastMap);
    if (response.status === HTTP_BAD_SUBMISSION) {
      setErrors({ ...errors, [projectToSubmit.id]: response.data });
    } else {
      const newCachedProjects = cachedProjects.slice();
      newCachedProjects[index] = { ...projectToSubmit };
      setCachedProjects(newCachedProjects);
    }
  };

  const createProject = async () => {
    const data = cloneDeep(newProject);
    // the id is an invalid sentinel value and the API expects no id for a creation
    delete data.id;

    setInFlight([...inFlight, newProject.id]);
    const response = await performAPIAction(API.createProject, data, null, toast);
    setInFlight(inFlight.filter((inFlightId) => inFlightId !== newProject.id));

    toastBasedOnResponse(response, toast, toastMap);
    if (response.status === HTTP_BAD_SUBMISSION) {
      setErrors({ ...errors, [response.data.id]: response.data.errors });
    } else {
      const updatedErrors = cloneDeep(errors);
      delete updatedErrors[newProject.id];
      setErrors(updatedErrors);
      setLoadedProjects([...loadedProjects, { ...response.data.project }]);
      setCachedProjects([...JSON.parse(JSON.stringify(loadedProjects)), { ...response.data.project }]);
      setShowModal(false);
      setNewProject(DEFAULT_NEW_PROJECT);
    }
  };

  const updateAllProjects = async () => {
    const existingErrors = Object.entries(errors).filter(([, value]) => Object.keys(value).length > 0);
    if (existingErrors.length > 0) {
      // unresolved errors
      toast(
        DEFAULT_ERROR_MESSAGE_TITLE,
        'Please resolve errors before submitting.',
        flavors.error,
      );
      return;
    }

    setInFlight(loadedProjects.map((project) => project.id));
    const response = await performAPIAction(API.updateAllProjects, loadedProjects, null, toast);
    setInFlight([]);

    if (response.status !== HTTP_NETWORK_ERROR) {
      const { title, flavor } = toastMap[response.status];
      toast(
        title,
        response.data.message ?? response.data.error,
        flavor,
      );
    }
    if (response.status === HTTP_BAD_SUBMISSION) {
      setErrors({ ...errors, [response.data.id]: response.data.errors });
    } else if (response.status === HTTP_SUCCESS) {
      setCachedProjects(loadedProjects);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await performAPIAction(API.retrieveProjects, null, null, toast);
      setLoaded(true);
      setProjectsLoaded(true);
      if (response.status === HTTP_SUCCESS) {
        setLoadedProjects(loadedProjects.concat(response.data.slice()));
        setCachedProjects(cachedProjects.concat(cloneDeep(response.data.slice())));
      } else {
        toast(
          DEFAULT_ERROR_MESSAGE_TITLE,
          PROJECTS_FAILED_TO_LOAD,
          flavors.error,
        );
      }
    };
    fetchProjects();
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

  const openModal = () => {
    resetNewProject();
    setShowModal(true);
  };

  const resetNewProject = () => {
    const updatedErrors = cloneDeep(errors);
    delete updatedErrors[newProject.id];
    setErrors(updatedErrors);
    setNewProject(DEFAULT_NEW_PROJECT);
  };

  const resetProject = (index) => {
    const currentLoadedProjects = loadedProjects.slice();
    currentLoadedProjects[index] = { ...cachedProjects[index] };
    const updatedErrors = cloneDeep(errors);
    delete updatedErrors[currentLoadedProjects[index].id];
    setErrors(updatedErrors);
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

  const setModalVisibility = (value) => {
    if (!value) {
      const updatedErrors = cloneDeep(errors);
      delete updatedErrors[newProject.id];
      setErrors(updatedErrors);
    }
    setShowModal(value);
  };

  return (
    <SpottedSection>
      <Modal
        showModal={showModal}
        setShowModal={setModalVisibility}
        title={
          <span>Add new Project</span>
      }
        content={(
          <Project
            onSrcChange={(value) => handleNewProjectChange(value, 'src')}
            onTitleChange={(value) => handleNewProjectChange(value, 'title')}
            onSubmit={createProject}
            onReset={resetNewProject}
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
          <SecondaryButton onClick={openModal}>
            Add New Project
            {' '}
            <FontAwesomeIcon icon={faPlus} />
          </SecondaryButton>
        </ButtonGroup>
      </TitleButtonPairing>
      <WrappedCenteredContent>
        {loadedProjects.map((project, index) => (
          <Project
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
