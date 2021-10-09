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
  affiliationText, affiliationLink, onTextChange, onLinkChange, onSubmit, onReset, onDelete,
}) => (
  <FooterForm>
    <FormInput type="text" name="affiliationText" label="Text" onChange={onTextChange} value={affiliationText} />
    <FormInput type="text" name="affiliationLink" label="Link" onChange={onLinkChange} value={affiliationLink} />
    <ButtonGroup>
      <PrimaryButton type="button" onClick={onSubmit}>Save</PrimaryButton>
      <WarningButton type="button" onClick={onReset}>Reset</WarningButton>
      <DangerButton type="button" onClick={onDelete}>Delete</DangerButton>
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
  onDelete: PropTypes.func.isRequired,
};
export default EditableAffiliation;
