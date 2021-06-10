import React from 'react';
import ButtonGroup from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import WarningButton from '@Components/Buttons/WarningButton';
import FormInput, { FormCheckbox } from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import PropTypes from 'prop-types';

export const EditableExperienceComponent = ({
  year,
  onYearChange,
  link,
  onLinkChange,
  tba,
  onTbaChange,
  credit,
  onCreditChange,
  onSubmit,
  onReset,
}) => (
  <StyledForm>
    <FormInput
      type="number"
      value={year}
      name="ExperienceYear"
      label="Year"
      onChange={onYearChange}
    />
    <FormInput
      type="text"
      label="Link to credit"
      name="ExperienceLink"
      value={link}
      onChange={onLinkChange}
    />
    <FormInput
      type="text"
      label="Credit text"
      name="ExperienceCredit"
      value={credit}
      onChange={onCreditChange}
    />
    <FormCheckbox name="ExperienceTBA" label="TBA?" value={tba} onChange={onTbaChange} />
    <ButtonGroup>
      <PrimaryButton type="button" onClick={onSubmit}>Save</PrimaryButton>
      <WarningButton type="button" onClick={onReset}>Reset Changes</WarningButton>
    </ButtonGroup>
  </StyledForm>
);

EditableExperienceComponent.propTypes = {
  year: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  tba: PropTypes.bool.isRequired,
  onTbaChange: PropTypes.func.isRequired,
  credit: PropTypes.string.isRequired,
  onCreditChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default EditableExperienceComponent;
