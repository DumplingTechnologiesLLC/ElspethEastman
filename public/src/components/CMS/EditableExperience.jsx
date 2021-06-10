import React, { useEffect, useState, useContext } from 'react';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { css } from 'styled-components';
import SectionTitle from '@Components/Text/SectionTitle';
import ContentParagraph from '@Components/Text/ContentParagraph';
import SectionTitleUnderText from '@Components/Text/SectionTitleUnderText';
import { ToastContext } from '@Components/ToastManager';
import { ReactComponent as ExternalLink } from '@Assets/svg/ExternalLink.svg';
import DangerButton from '@Components/Buttons/DangerButton';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import API from '@App/api';
import Modal from '@Components/Modal/Modal';
import EditableExperienceComponent from './EditableExperienceComponent';

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
const LineContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: .25em;
  height: 40px;
`;
const ExperienceLine = styled(ContentParagraph)`
  ${({ theme }) => css`
    ${theme.text.mediumContentText};
    display: inline-block;
    text-decoration: none;
    svg {
      height: 1em;
    }
    fill: ${theme.flavors.baseTextColor};
  `}
`;
const miniButtonCss = css`
  display: inline;
  white-space: nowrap;
  width: auto;
  margin-right: .25em;
`;
export const DeleteButton = styled(DangerButton)`
  ${miniButtonCss}
`;

export const EditButton = styled(PrimaryButton)`
  ${miniButtonCss}
`;

export const EditableExperience = () => {
  const [experience, setExperience] = useState({});
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast, flavors } = useContext(ToastContext);

  /**
   *  Create an experience object
   * @function experienceFactory
   * @param {String} category
   * @returns {Object}
   */
  const experienceFactory = (category) => ({
    // this is hacky but the years from the backend are returned as (####) or (TBA) so to match we generate years
    // as (####)
    year: `(${Number(new Date().getFullYear())})`,
    link: '',
    credit: '',
    tba: false,
    category,
  });
  const [currentlyEditedExperience, setCurrentlyEditedExperience] = useState({});
  const [cachedCurrentlyEditedExperience, setCachedCurrentlyEditedExperience] = useState({});

  /**
   * Populate the modal form and open the modal
   * @function openModal
   * @param {Experience Object} exp
   */
  const openModal = (exp) => {
    // year can be undefined
    const year = exp?.year ?? '';
    const coercedExp = {
      ...exp,
      year: year.match(/([0-9]){4}/g)?.[0] ?? null,
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
    setCurrentlyEditedExperience({});
    setCachedCurrentlyEditedExperience({});
    setShowModal(false);
  };

  /**
   * Create a new experiene in the selected category
   * @function createNewExperience
   * @param {String} category
   * @listens onclick create button
   */
  const createNewExperience = (category) => {
    const newExperience = experienceFactory(category);
    openModal(newExperience);
  };

  const lookup = {
    voiceCredits: 'Voice Credits',
    musicGames: 'Music - Games',
    musicMiscellaneous: 'Music - Miscellaneous',
    streamingCredits: 'Streaming Credits',
  };

  const toastMap = {
    404: {
      flavor: flavors.error,
      title: 'Error',
      content: 'Experience no longer exists. Perhaps it was already deleted?',
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
   * Credits can optionally have a year, so we need to append the year to the front if it exists
   * @function formatCredit
   * @param {Object} credit
   * @returns {String}
   */
  const formatCredit = (credit) => (credit.year ? `${credit.year} ${credit.credit}` : credit.credit);

  /**
   * Deletes a selected experience after prompting the user to confirm their choice
   * @function confirmDelete
   * @param {Object} exp the experience to be deleted
   * @param {String} section the section the experience belongs to
   * @listens onclick of delete button
   */
  const confirmDelete = async (exp, section) => {
    /**
     * Disabled because I don't want to be implementing an entire alert modal for this one off project.
     * The basic JS alert is sufficient.
     */
    /* eslint-disable-next-line no-alert, no-restricted-globals */
    const confirmed = confirm('Are you sure you want to delete this experience?');
    if (confirmed) {
      const response = await API.deleteExperience(exp.id);
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
        const newExperiences = JSON.parse(JSON.stringify(experience));
        newExperiences[section] = JSON.parse(
          JSON.stringify(experience[section].filter((existingExperience) => existingExperience.id !== exp.id)),
        );
        setExperience(newExperiences);
      }
    }
  };

  /**
   * Saves currently edited experience
   * @function saveExperience
   * @listens onClick of modal save button
   */
  const saveExperience = async () => {};

  const handleUpdatingExperience = (field, value) => setCurrentlyEditedExperience({
    ...currentlyEditedExperience,
    [field]: value,
  });

  const resetForm = () => setCurrentlyEditedExperience(cachedCurrentlyEditedExperience);

  /* eslint-disable no-confusing-arrow */
  /**
   * Iterate through experiences and render them
   * @function showExperience
   * @param {Array} experiences
   * @param {String} section
   * @returns {Nodes}
   */
  const showExperience = (experiences, section) => experiences?.map((exp) => (
    <LineContainer key={exp.id}>
      <DeleteButton onClick={() => confirmDelete(exp, section)}>
        <FontAwesomeIcon icon={faTrash} />
      </DeleteButton>
      <EditButton onClick={() => openModal(exp)}>
        <FontAwesomeIcon icon={faEdit} />
      </EditButton>
      <ExperienceLine
        key={exp?.id}
        as={exp?.link ? 'a' : 'p'}
        href={exp?.link ? exp.link : undefined}
        target={exp?.link ? '_blank' : undefined}
        rel="noreferrer"
      >
        {formatCredit(exp)}
        {exp?.link ? <ExternalLink /> : ''}
      </ExperienceLine>
    </LineContainer>
  ));

  useEffect(() => {
    if (!experienceLoaded) {
      API.retrieveExperience().then((results) => {
        if (results !== null) {
          setExperience(results);
          setExperienceLoaded(true);
        } else {
          setExperienceLoaded(true);
          toast(
            'Error',
            'Failed to load experience list',
            flavors.error,
          );
        }
      }).catch(() => {
        setExperienceLoaded(true);
        toast(
          'Error',
          'Failed to load experience list',
          flavors.error,
        );
      });
    }
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
              <EditableExperienceComponent
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
        {' '}
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

export default EditableExperience;
