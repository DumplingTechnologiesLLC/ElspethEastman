import React, { useEffect, useState, useContext } from 'react';

import styled, { css } from 'styled-components';
import SectionTitle from '@Components/Text/SectionTitle';

import SectionTitleUnderText from '@Components/Text/SectionTitleUnderText';
import { ToastContext } from '@Components/ToastManager';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import API from '@App/api';
import Modal from '@Components/Modal/Modal';
import { cloneDeep, toastMapFactory } from '@App/utils';
import {
  performAPIAction, performAPIDelete, HTTP_SUCCESS, toastBasedOnResponse,
} from '@App/api/utils';
import Experience, { ExperienceLine } from './experience/Experience';
import EditableExperience from './experience/EditableExperience';
import { experienceFactory, lookup } from './experience';

const ExperienceContainer = styled.section`
  ${(props) => css`
    margin-top: ${props.theme.spacing.jumbo};  
  `}
`;

const ColoredSection = styled.div`
  flex: 1;
  ${(props) => css`
    padding: ${props.theme.spacing.md};
    border-color: ${props.theme.flavors[props.color] ?? props.theme.flavors.background};
    border-width: 2px;
    border-style: solid;
  `}
`;
const Row = styled.div`
  display: flex;
  min-width: 100%;
  flex-wrap: wrap;
`;
const Column = styled.div`
  flex: 1;
  min-width: max(50%, 300px);
  display: flex;
  flex-direction: column;
`;

const ColoredTitle = styled.h3`
  ${(props) => css`
    ${props.theme.text.categoryTitle};
    color: ${props.theme.flavors[props.color] ?? 'black'};
  `}
`;

const DEFAULT_EXPERIENCE = {
  link: '',
  tba: false,
  credit: '',
  year: '',
};

const DEFAULT_EXPERIENCES = {};
const DEFAULT_CATEGORY = '';

const EditableExperiences = () => {
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCES);
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const [currentlyEditedCategory, setCurrentlyEditedCategory] = useState(DEFAULT_CATEGORY);
  const [showModal, setShowModal] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
  const [currentlyEditedExperience, setCurrentlyEditedExperience] = useState(DEFAULT_EXPERIENCE);
  const [cachedCurrentlyEditedExperience, setCachedCurrentlyEditedExperience] = useState(DEFAULT_EXPERIENCE);

  /**
   * Populate the modal form and open the modal
   * @function openModal
   * @param {Experience Object} exp
   */
  const openModal = (exp) => {
    // year can be undefined
    const year = exp?.year.match(/([0-9]){4}/g)?.[0] ?? null;
    const coercedExp = {
      ...exp,
      year: year === null ? null : Number(year),
    };
    setCurrentlyEditedExperience(coercedExp);
    setCachedCurrentlyEditedExperience(coercedExp);
    setShowModal(true);
  };

  /**
   * Close the modal and reset the form.
   * @function closeModal
   * @listens onclick closeModal button or backdrop
   */
  const closeModal = () => {
    setCurrentlyEditedExperience(DEFAULT_EXPERIENCE);
    setCachedCurrentlyEditedExperience(DEFAULT_EXPERIENCE);
    setCurrentlyEditedCategory(DEFAULT_CATEGORY);
    setShowModal(false);
  };

  /**
   * Create a new experiene in the selected category
   * @function createNewExperience
   * @param {String} category
   * @listens onclick create button
   */
  const createNewExperience = (category) => {
    setCurrentlyEditedCategory(category);
    const newExperience = experienceFactory(category);
    openModal(newExperience);
  };

  const toastMap = toastMapFactory('Experience no longer exists. Perhaps it was already deleted?');

  /**
   * Deletes a selected experience after prompting the user to confirm their choice
   * @function confirmDelete
   * @param {Object} exp the experience to be deleted
   * @param {String} section the section the experience belongs to
   * @listens onclick of delete button
   */
  const confirmDelete = async (exp, section) => {
    const response = await performAPIDelete(API.deleteExperience, exp.id, toast);
    if (response !== false) {
      // user did not cancel out
      toastBasedOnResponse(response, toast, toastMap);
      const newExperiences = cloneDeep(experience);
      newExperiences[section] = cloneDeep(
        experience[section].filter((existingExperience) => existingExperience.id !== exp.id),
      );
      setExperience(newExperiences);
    }
  };

  /**
   * Saves currently edited experience
   * @function saveExperience
   * @listens onClick of modal save button
   */
  const saveExperience = async () => {
    const submittedExperience = cloneDeep(currentlyEditedExperience);
    if (submittedExperience.year === '') {
      submittedExperience.year = null;
    }
    const endpoint = typeof submittedExperience.id === 'undefined' ? API.createExperience : API.updateExperience;
    const payload = typeof submittedExperience.id === 'undefined'
      ? cloneDeep(submittedExperience) : { ...submittedExperience, category: currentlyEditedCategory };
    const response = await performAPIAction(endpoint, payload, submittedExperience.id, toast);
    toastBasedOnResponse(response, toast, toastMap);
    if (response.status === HTTP_SUCCESS) {
      const newExperiences = cloneDeep(experience);
      newExperiences[currentlyEditedCategory] = typeof submittedExperience.id === 'undefined'
        ? cloneDeep(experience[currentlyEditedCategory].concat([{ ...response.data.object }]))
        : cloneDeep(
          /**
           * This is a pretty straightforward ternary
           */
          /* eslint-disable-next-line no-confusing-arrow */
          experience[currentlyEditedCategory].map((exp) => exp.id === submittedExperience.id
            ? { ...response.data.object }
            : exp),
        );
      closeModal();
      setExperience(newExperiences);
    }
  };

  const handleUpdatingExperience = (field, value) => {
    setCurrentlyEditedExperience({
      ...currentlyEditedExperience,
      [field]: value,
    });
  };

  const resetForm = () => setCurrentlyEditedExperience(cachedCurrentlyEditedExperience);

  /**
   * Iterate through experiences and render them
   * @function showExperience
   * @param {Array} experiences
   * @param {String} section
   * @returns {Nodes}
   */
  const showExperience = (experiences, section) => experiences?.map((exp) => (
    <Experience
      onDelete={() => confirmDelete(exp, section)}
      onEdit={() => {
        setCurrentlyEditedCategory(section);
        setCurrentlyEditedExperience(exp);
        openModal(exp);
      }}
      experience={exp}
      key={exp?.id}
    />
  ));

  useEffect(() => {
    const retrieveExperienceList = async () => {
      if (!experienceLoaded) {
        const response = await performAPIAction(API.retrieveExperience, null, null, toast);
        setExperienceLoaded(true);
        if (response === null) {
          toast(
            'Error',
            'Failed to load experience list',
            flavors.error,
          );
        } else {
          setExperience(response.data);
        }
      }
    };
    retrieveExperienceList();
  /**
   * We don't want this hook firing every time the reference for toast changes.
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  }, [experienceLoaded]);
  const year = new Date().getFullYear();
  return (
    <ExperienceContainer>
      <Modal
        showModal={showModal}
        setShowModal={closeModal}
        title={<span>Experience Form</span>}
        content={(
          showModal
            ? (
              <EditableExperience
            /**
             * Disabled because we control what currentlyEditedExperience is, so we know its safe
             * and it's easier than manually enumerating all the attributes of the object
             */
            /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...currentlyEditedExperience}
                onYearChange={(value) => handleUpdatingExperience('year', value)}
                onLinkChange={(value) => handleUpdatingExperience('link', value)}
                onTbaChange={(value) => handleUpdatingExperience('tba', value)}
                onCreditChange={(value) => handleUpdatingExperience('credit', value)}
                onSubmit={saveExperience}
                onReset={resetForm}
              />
            ) : <span>Loading</span>
        )}
      />
      <SectionTitle id="Experience">
        Experience
        <br />
        <SectionTitleUnderText>
          2012 -
          {year}
        </SectionTitleUnderText>
      </SectionTitle>
      <Row>
        <Column>
          <ColoredSection color="bgBlue">
            <ColoredTitle color="textBlue">{lookup.voiceCredits}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.voiceCredits], lookup.voiceCredits)
              : <ExperienceLine>Loading</ExperienceLine>}
            <PrimaryButton onClick={() => createNewExperience(lookup.voiceCredits)}>Add new credit</PrimaryButton>
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgYellow">
            <ColoredTitle color="textYellow">{lookup.musicGames}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.musicGames], lookup.musicGames)
              : <ExperienceLine>Loading</ExperienceLine>}
            <PrimaryButton onClick={() => createNewExperience(lookup.musicGames)}>Add new music</PrimaryButton>
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgPink">
            <ColoredTitle color="textPink">{lookup.musicMiscellaneous}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.musicMiscellaneous], lookup.musicMiscellaneous)
              : <ExperienceLine>Loading</ExperienceLine>}
            <PrimaryButton onClick={() => createNewExperience(lookup.musicMiscellaneous)}>Add new music</PrimaryButton>
          </ColoredSection>
        </Column>
        <Column>
          <ColoredSection color="bgGreen">
            <ColoredTitle color="textGreen">{lookup.streamingCredits}</ColoredTitle>
            {experienceLoaded
              ? showExperience(experience[lookup.streamingCredits], lookup.streamingCredits)
              : <ExperienceLine>Loading</ExperienceLine>}
            <PrimaryButton onClick={() => createNewExperience(lookup.streamingCredits)}>Add new credit</PrimaryButton>
          </ColoredSection>
        </Column>
      </Row>
    </ExperienceContainer>
  );
};

export default EditableExperiences;
