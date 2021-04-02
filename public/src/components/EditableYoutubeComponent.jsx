import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import styled, { css } from 'styled-components';
import ButtonGroup from './Buttons/ButtonGroup';
import PrimaryButton from './Buttons/PrimaryButton';
import SecondaryButton from './Buttons/SecondaryButton';
import FormInput from './Form/FormInput';
import StyledForm from './Form/StyledForm';
import YoutubeComponent from './YoutubeComponent';

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

export const EditableYoutubeComponent = ({ src, title }) => {
  const [preview, setPreviewState] = useState(false);
  return (
    <EditableYoutubeForm>
      {preview ? <YoutubeComponent src={src} title={title} />
        : (
          <StyledForm>
            <FormInput label="Title" value={title} name={`${title}-title`} />
            <FormInput label="Video Source" value={src} name={`${title}-source`} />
          </StyledForm>
        )}
      <CustomButtonGroup toggled={preview}>
        <SecondaryButton onClick={() => setPreviewState(!preview)}>{preview ? 'View Form' : 'Preview'}</SecondaryButton>
        <PrimaryButton>
          Save
          {' '}
          <FontAwesomeIcon icon={faSave} />
        </PrimaryButton>
      </CustomButtonGroup>
    </EditableYoutubeForm>
  );
};

EditableYoutubeComponent.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default EditableYoutubeComponent;
