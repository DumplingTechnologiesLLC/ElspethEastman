import ButtonGroup from '@Components/Buttons/ButtonGroup';
import DangerButton from '@Components/Buttons/DangerButton';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import WarningButton from '@Components/Buttons/WarningButton';
import FormInput from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const FooterForm = styled(StyledForm)`
  background-color: white;
  padding: 1em;
  & > div {
    align-items: flex-start;
  }
  ${ButtonGroup} {
    margin-top: 1em;
  }
  margin-bottom: 1em;
`;

export const EditableAffiliation = ({
  affiliationText,
  affiliationLink,
  onTextChange,
  onLinkChange,
  onSubmit,
  onReset,
  onDelete,
  disabled,
  showDelete,
  errors,
}) => (
  <FooterForm>
    <FormInput
      hasError={!!errors?.affiliation}
      errorMessage={errors?.affiliation ?? ''}
      type="text"
      name="affiliationText"
      label="Text"
      onChange={onTextChange}
      value={affiliationText}
    />
    <FormInput
      hasError={!!errors?.link}
      errorMessage={errors?.link ?? ''}
      type="text"
      name="affiliationLink"
      label="Link"
      onChange={onLinkChange}
      value={affiliationLink}
    />
    <ButtonGroup>
      <PrimaryButton disabled={disabled} type="button" onClick={onSubmit}>Save</PrimaryButton>
      <WarningButton disabled={disabled} type="button" onClick={onReset}>Reset</WarningButton>
      {showDelete && <DangerButton disabled={disabled} type="button" onClick={onDelete}>Delete</DangerButton>}
    </ButtonGroup>
  </FooterForm>
);

EditableAffiliation.propTypes = {
  affiliationText: PropTypes.string.isRequired,
  affiliationLink: PropTypes.string.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
  showDelete: PropTypes.bool,
  errors: PropTypes.shape({
    affiliation: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    link: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  }),
};

EditableAffiliation.defaultProps = {
  disabled: false,
  showDelete: true,
};
export default EditableAffiliation;
