import React from 'react';
import ButtonGroup from '@Components/Buttons/ButtonGroup';
import PrimaryButton from '@Components/Buttons/PrimaryButton';
import WarningButton from '@Components/Buttons/WarningButton';
import FormInput, { FormCheckbox } from '@Components/Form/FormInput';
import StyledForm from '@Components/Form/StyledForm';
import PropTypes from 'prop-types';

export const EditableExperience = ({
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
  errors,
}) => (
  <StyledForm>
    <FormInput
      type="number"
      value={year}
      name="ExperienceYear"
      label="Year"
      onChange={onYearChange}
      hasError={typeof errors?.year !== 'undefined'}
      errorMessage={errors?.year ?? ''}
    />
    <FormInput
      type="text"
      label="Link to credit"
      name="ExperienceLink"
      value={link}
      onChange={onLinkChange}
      hasError={typeof errors?.link !== 'undefined'}
      errorMessage={errors?.link ?? ''}
    />
    <FormInput
      type="text"
      label="Credit text"
      name="ExperienceCredit"
      value={credit}
      onChange={onCreditChange}
      hasError={typeof errors?.credit !== 'undefined'}
      errorMessage={errors?.credit ?? ''}
    />
    <FormCheckbox
      name="ExperienceTBA"
      label="TBA?"
      hasError={typeof errors?.tba !== 'undefined'}
      errorMessage={errors?.tba}
      value={tba}
      onChange={onTbaChange}
    />
    <ButtonGroup>
      <PrimaryButton type="button" onClick={onSubmit}>Save</PrimaryButton>
      <WarningButton type="button" onClick={onReset}>Reset Changes</WarningButton>
    </ButtonGroup>
  </StyledForm>
);

EditableExperience.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onYearChange: PropTypes.func.isRequired,
  link: PropTypes.string.isRequired,
  onLinkChange: PropTypes.func.isRequired,
  tba: PropTypes.bool.isRequired,
  onTbaChange: PropTypes.func.isRequired,
  credit: PropTypes.string.isRequired,
  onCreditChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.arrayOf(PropTypes.string)]),
    link: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.arrayOf(PropTypes.string)]),
    credit: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.arrayOf(PropTypes.string)]),
    tba: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.arrayOf(PropTypes.string)]),
  }),
};

export default EditableExperience;
