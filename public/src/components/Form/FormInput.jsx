import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import FormInputContainer from './FormInputContainer';

const StyledInput = styled.input`
  ${(props) => css`
    ${props.theme.input.defaultStyling}
    ${props.error ? props.theme.input.errorStyling : ''}
  `}
`;

const StyledTextArea = styled.textarea`
  resize: vertical;
  ${(props) => css`
    ${props.theme.input.defaultStyling}
    ${props.error ? props.theme.input.errorStyling : ''}
  `}
`;

const StyledLabel = styled.label`
  ${(props) => css`
    ${props.theme.text.contentText}
  `}
`;

const ErrorMessage = styled.span`
  ${(props) => css`
    ${props.theme.text.baseContentFont};
    ${props.theme.text.smallFontSize};
    color: ${props.theme.flavors.errorText};
  `}
`;

export const FormInput = ({
  autoFocus, label, type, value, setValue, name, placeholder, errorMessage, hasError,
}) => {
  const inputEl = useRef(null);
  useEffect(() => {
    if (autoFocus) {
      inputEl.current.focus();
    }
  });
  return (
    <FormInputContainer>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledInput
        ref={inputEl}
        type={type}
        error={hasError}
        onChange={(e) => setValue(e.target.value)}
        name={name}
        value={value}
        placeholder={placeholder}
      />
      {errorMessage ? (<ErrorMessage>{errorMessage}</ErrorMessage>) : ''}
    </FormInputContainer>
  );
};

export const FormTextArea = ({
  autoFocus, label, value, setValue, name, placeholder, errorMessage, hasError,
}) => {
  const inputEl = useRef(null);
  useEffect(() => {
    if (autoFocus) {
      inputEl.current.focus();
    }
  });
  return (
    <FormInputContainer>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledTextArea
        error={hasError}
        onChange={(e) => setValue(e.target.value)}
        name={name}
        value={value}
        placeholder={placeholder}
      />
      {errorMessage ? (<ErrorMessage>{errorMessage}</ErrorMessage>) : ''}
    </FormInputContainer>
  );
};

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
  setValue: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
};

FormInput.defaultProps = {
  placeholder: '',
  hasError: false,
  errorMessage: '',
  autoFocus: false,
};

FormTextArea.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
  setValue: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
};

FormTextArea.defaultProps = {
  placeholder: '',
  hasError: false,
  errorMessage: '',
  autoFocus: false,
};

export default FormInput;
