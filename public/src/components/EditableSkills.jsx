import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import API from '../api';
import ContentParagraph from './Text/ContentParagraph';
import { Row } from './Layout/Layout';
import SpottedSection from './Layout/SpottedSection';
import Elephant from '../assets/elephant.webp';
import { ToastContext } from './ToastManager';
import {
  SkillDescriptionContainer,
  PieContainer,
  PieTextContainer,
  SkillSvg,
  SkillPie,
} from './Skills';
import { FormTextArea } from './Form/FormInput';
import PrimaryButton from './Buttons/PrimaryButton';
import ButtonGroup from './Buttons/ButtonGroup';
import WarningButton from './Buttons/WarningButton';

const SkillFormContainer = styled(SkillDescriptionContainer)`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: flex;
  textarea {
    min-height: 150px;
  }
  ${ButtonGroup} {
    margin-top: ${({ theme }) => theme.spacing.md}
  }
`;
export const EditableSkills = () => {
  const [displayedValue, setDisplayedValue] = useState('');
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [skills, setSkills] = useState({});
  const { toast, flavors } = useContext(ToastContext);
  const [lookup, setLookup] = useState({});
  const [updatedSkills, setUpdatedSkills] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const updateValue = (skill, value) => {
    setUpdatedSkills({
      ...updatedSkills,
      [lookup[skill]]: value,
    });
  };
  const retrieveSkill = (skill) => {
    if (skillsLoaded) {
      return updatedSkills[lookup[skill]] ?? skills[lookup[skill]] ?? 'Skills failed to load...';
    }
    return (<FontAwesomeIcon size="lg" icon={faSpinner} pulse />);
  };
  const submitSkills = async () => {
    setSubmitting(true);
    const response = await API.updateSkills({
      ...skills,
      ...updatedSkills,
    });
    setSubmitting(false);
    if (response === null || response.status !== 200) {
      if (response.status === 403) {
        toast(
          'Error',
          'Your session has expired. Please log in again',
          flavors.error,
        );
        return;
      }
      toast(
        'Error',
        `There was an issue updating skills. ${
          response === null
            ? 'There was a network error.'
            : `${
              Object.keys(response.data).join(', ')
            } contain${Object.keys(response.data).length > 1 ? '' : 's'} errors`}`,
        flavors.error,
      );
      setErrors(response === null ? {} : response.data);
    } else {
      toast(
        'Success',
        'Successfully updated skills',
        flavors.success,
      );
      setSkills(response.data);
    }
  };
  useEffect(() => {
    if (!skillsLoaded) {
      API.retrieveSkills().then((results) => {
        if (results !== null) {
          setSkills(results.data);
          setLookup(results.lookup);
          setDisplayedValue(results.lookup.voice_acting);
          setSkillsLoaded(true);
        } else {
          setSkillsLoaded(true);
          toast(
            'Error',
            'Failed to load skills',
            flavors.error,
          );
        }
      }).catch(() => {
        setSkillsLoaded(true);
        toast(
          'Error',
          'Failed to load skills',
          flavors.error,
        );
      });
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <SpottedSection>
      <Row>
        <PieContainer columnCount={2}>
          {/* eslint-disable max-len */}
          <PieTextContainer>
            <ContentParagraph as="span">Select One</ContentParagraph>
          </PieTextContainer>
          <SkillSvg x="0px" y="0px" viewBox="0 0 500 500">
            <g>
              <SkillPie
                aria-label={lookup.streaming}
                role="button"
                tabIndex="0"
                active={displayedValue === lookup.streaming}
                onClick={() => setDisplayedValue(lookup.streaming)}
                d="M240.83,489.39c-18.91,0.07-37.21-3.48-55.41-8.36c-14.66-3.93-28.77-9.49-42.08-16.25c-17.07-8.67-33.7-18.59-48.22-31.45
                c-21.03-18.62-38.86-39.75-52.88-64.24c-10.89-19.02-18.55-39.08-23.82-60.25c-3.08-12.38-5.44-24.88-6.44-37.55
                c-0.85-10.8-1.56-21.77-0.66-32.53c1.83-22,4.71-43.98,12.81-64.73c4.84-12.4,10.72-24.4,16.36-36.47
                c2.02-4.32,3.27-4.45,7.28-2.15c27.25,15.68,54.52,31.35,81.77,47.04c12.76,7.35,25.5,14.73,38.24,22.1
                c2.81,1.62,3.78,3.75,2.18,6.89c-5.2,10.22-8.09,21-9.27,32.48c-2.33,22.66,4.23,42.54,17.57,60.42
                c11.58,15.51,26.72,26.21,45.55,31.14c6.6,1.73,13.46,2.52,20.23,3.51c2.78,0.4,3.5,1.81,3.49,4.33
                c-0.03,47.26-0.02,94.51-0.03,141.77C247.51,489.39,247.14,489.59,240.83,489.39z"
              />
              <text transform="translate(50 320)">
                <tspan x="0" y="0">{lookup.streaming}</tspan>
              </text>
              <SkillPie
                tabIndex="0"
                aria-label={lookup.game_development}
                role="button"
                active={displayedValue === lookup.game_development}
                onClick={() => setDisplayedValue(lookup.game_development)}
                d="M454,128.42c-0.86,1.03-1.45,2.23-2.4,2.8c-13.42,7.96-26.85,15.91-40.36,23.72c-17.07,9.86-34.22,19.58-51.32,29.38
                c-10.28,5.89-20.53,11.86-30.82,17.74c-3.06,1.75-4.58-0.71-6.12-2.6c-3.71-4.55-7-9.49-11.02-13.74
                c-12.84-13.61-28.67-21.5-47.16-24.73c-23.01-4.02-43.99,0.97-63.48,13.07c-10.18,6.32-17.85,15.36-24.52,25.22
                c-2.02,2.98-3.95,3.43-7.17,1.54c-20.45-12.01-40.99-23.86-61.53-35.71c-20.11-11.6-40.23-23.17-60.41-34.65
                c-2.9-1.65-3.63-3.15-1.77-6.18c6.96-11.31,13.88-22.61,23.22-32.2c2.9-2.98,5.68-6.07,8.49-9.14c8.8-9.59,19.33-17.11,29.33-25.33
                c14.7-12.08,31.65-20.09,48.38-28.45c13.29-6.64,27.8-10.18,42.33-13.13c10.62-2.16,21.35-3.98,32.11-5.17
                c7.14-0.79,14.43-0.02,21.65-0.27c23.33-0.81,45.89,3.51,67.85,10.8c13.3,4.42,26.62,9.2,39.18,15.36
                c13.76,6.75,26.65,15.27,38.33,25.4c6.35,5.51,13.05,10.63,19.19,16.35c10.98,10.23,19.77,22.34,28.37,34.55
                c2.86,4.06,5.48,8.3,8.18,12.48C453.04,126.33,453.4,127.24,454,128.42z"
              />
              <text transform="translate(270 80)">
                <tspan x="-45" y="0">{lookup.game_development?.split(' ')?.[0] ?? ''}</tspan>
                <tspan x="-78.309" y="27">{lookup.game_development?.split(' ')?.[1] ?? 'Loading'}</tspan>
              </text>
              <SkillPie
                tabIndex="0"
                aria-label={lookup.voice_acting}
                role="button"
                active={displayedValue === lookup.voice_acting}
                onClick={() => setDisplayedValue(lookup.voice_acting)}
                d="M251.36,414.95c-0.01-22.93-0.01-45.86,0-68.8c0-4.94,0.52-5.31,5.37-5.6c9.21-0.57,18.08-2.57,26.77-5.82
                c21.68-8.1,37.13-22.9,46.96-43.56c11.17-23.48,12.33-47.41,1.92-71.57c-0.74-1.73-1.44-3.48-2.23-5.18
                c-2.08-4.45-1.77-5.45,2.39-7.85c17.88-10.3,35.75-20.61,53.63-30.91c22.02-12.69,44.05-25.38,66.08-38.05
                c5.96-3.42,6.02-3.3,9.39,2.68c10.2,18.08,17.03,37.45,21.48,57.62c4.99,22.62,6.74,45.43,5.67,68.73
                c-1.48,32.18-10.48,62.05-24.12,90.75c-13.86,29.16-33.93,53.62-58.11,74.87c-27.96,24.57-60.33,40.76-96.05,50.24
                c-11.11,2.95-22.76,3.94-34.22,5.48c-6.6,0.89-13.28,1.32-19.93,1.52c-4.64,0.13-4.98-0.52-4.98-5.4
                C251.35,461.04,251.36,437.99,251.36,414.95z"
              />
              <text transform="translate(340 320)">
                <tspan x="0" y="0">{lookup.voice_acting}</tspan>
              </text>

            </g>
            <image
              width="1904"
              height="1243"
              xlinkHref={Elephant}
              transform="matrix(-0.0748 0 0 0.0792 318.7545 200.7607)"
            />
          </SkillSvg>
        </PieContainer>
        <SkillFormContainer columnCount={2}>
          <FormTextArea
            name={displayedValue}
            onChange={(event) => updateValue(displayedValue, event)}
            value={retrieveSkill(displayedValue)}
            label={displayedValue}
            hasError={typeof errors[lookup[displayedValue]] !== 'undefined'}
            errorMessage={errors[lookup[displayedValue]]}
          />
          <ButtonGroup>
            <WarningButton onClick={() => setUpdatedSkills(skills)}>Reset Changes</WarningButton>
            <PrimaryButton
              onClick={submitSkills}
              disabled={submitting}
              aria-disabled={submitting}
            >
              Save All Changes
            </PrimaryButton>
          </ButtonGroup>
        </SkillFormContainer>
      </Row>
    </SpottedSection>
  );
};

export default EditableSkills;
