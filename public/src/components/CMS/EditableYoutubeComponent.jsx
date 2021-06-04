import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled, { css } from 'styled-components';
import ButtonGroup from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import SecondaryButton from '@Components/Buttons/SecondaryButton';
import WarningButton from '@Components/Buttons/WarningButton';
import FormInput from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import YoutubeComponent from '@Components/LandingPage/YoutubeComponent';
import DangerButton from '@Components/Buttons/DangerButton';

const EditableYoutubeForm = styled.div`
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  position: relative;
  flex: 50%;
  ${({ theme }) => css`
    margin  : ${theme.spacing.sm};
    background-color: white;
    border: 1px solid ${theme.flavors.blueTransparent};
    padding: ${theme.spacing.md}; 
    border-radius: 3px;
    box-sizing: border-box;
    ${theme.mixins.boxShadow('rgba(0, 0, 0, 0.05)')}
  `}
`;

const CustomButtonGroup = styled(ButtonGroup)`
  ${({ toggled, theme }) => css`
    ${toggled ? css`margin-top: -${theme.spacing.xl};` : ''}
  `}
`;

export const EditableYoutubeComponent = ({
  src, title, onSrcChange, onTitleChange, onSubmit, onReset, inFlight, errors,
}) => {
  const [preview, setPreviewState] = useState(false);

  const saveText = () => (inFlight ? (
    <FontAwesomeIcon icon={faSpinner} pulse />
  ) : (
    <span>
      Save
      {' '}
      <FontAwesomeIcon icon={faSave} />
    </span>
  ));

  const deleteText = () => (inFlight ? (
    <FontAwesomeIcon icon={faSpinner} pulse />
  ) : (
    <span>
      Delete
    </span>
  ));
  return (
    <EditableYoutubeForm>
      {preview ? <YoutubeComponent src={src} title={title} />
        : (
          <StyledForm>
            <FormInput
              hasError={typeof errors.title !== 'undefined'}
              errorMessage={errors.title ?? ''}
              type="text"
              onChange={onTitleChange}
              label="Title"
              value={title}
              name={`${title}-title`}
            />
            <FormInput
              hasError={typeof errors.src !== 'undefined'}
              errorMessage={errors.src ?? ''}
              type="text"
              onChange={onSrcChange}
              label="Video Source"
              value={src}
              name={`${title}-source`}
            />
          </StyledForm>
        )}
      <CustomButtonGroup toggled={preview}>

        <SecondaryButton onClick={() => setPreviewState(!preview)}>{preview ? 'View Form' : 'Preview'}</SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={inFlight}>
          { saveText() }
        </PrimaryButton>
        <WarningButton onClick={onReset} disabled={inFlight}>
          Reset
        </WarningButton>
        <DangerButton disabled={inFlight}>
          { deleteText() }
        </DangerButton>
      </CustomButtonGroup>
    </EditableYoutubeForm>
  );
};

EditableYoutubeComponent.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onSrcChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  inFlight: PropTypes.bool.isRequired,
  /**
   * Disabled because errors is an object that contains the errors for both inputs, and we validate all
   * properties used
   */
  /* eslint-disable-next-line react/forbid-prop-types */
  errors: PropTypes.object.isRequired,
};

export default EditableYoutubeComponent;
