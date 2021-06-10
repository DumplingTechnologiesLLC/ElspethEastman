import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import FormInputContainer from '@Components/Form/FormInputContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';

const StyledInput = styled.input`
  ${(props) => css`
    ${props.theme.input.defaultStyling};
    ${props.error ? props.theme.input.errorStyling : ''}
  `}
`;

const StyledTextArea = styled.textarea`
  resize: vertical;
  ${(props) => css`
    ${props.theme.input.defaultStyling};
    ${props.error ? props.theme.input.errorStyling : ''}
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => css`
    ${theme.text.contentText}
  `}
`;

const ErrorList = styled.ul`
  padding-left: 0;
  margin: 0;
  ${({ theme }) => css`
    color: ${theme.flavors.errorText};
    margin-left: ${theme.spacing.md};
  `}
`;

const ErrorMessage = styled.span`
  ${({ theme }) => css`
    ${theme.text.baseContentFont};
    ${theme.text.smallFontSize};
    color: ${theme.flavors.errorText};
  `}
`;

const commonInputProps = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
};

export const FormInput = ({
  autoFocus, label, type, value, onChange,
  name, placeholder, errorMessage, hasError,
  inputCaps,
}) => {
  const inputEl = useRef(null);
  useEffect(() => {
    if (autoFocus) {
      inputEl.current.focus();
    }
  });
  const formatErrorMessages = () => {
    if (errorMessage) {
      if (Array.isArray(errorMessage)) {
        return (
          <ErrorList>
            {errorMessage.map((error) => (<li key={error}><ErrorMessage>{error}</ErrorMessage></li>))}
          </ErrorList>
        );
      }
      return (<ErrorMessage>{errorMessage}</ErrorMessage>);
    }
    return '';
  };
  return (
    <FormInputContainer>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      {inputCaps}
      <StyledInput
        ref={inputEl}
        type={type}
        error={hasError}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        value={value}
        placeholder={placeholder}
      />
      {formatErrorMessages()}
    </FormInputContainer>
  );
};

const StyledCheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    color: ${theme?.flavors?.midBlue};
    pointer-events: none;
    height: 40px;
  `}
`;
const StyledCheckbox = styled.input`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  cursor: pointer;
  opacity: 0;
`;

const CheckboxLabel = styled(StyledLabel)`
  display: flex;
  cursor: pointer;
  align-items: center;
  ${StyledCheckboxContainer} {
    margin-right: .25em;
  }
`;
export const FormCheckbox = ({
  label, onChange, value, name,
}) => (
  <FormInputContainer>
    <CheckboxLabel htmlFor={name}>
      <StyledCheckbox
        type="checkbox"
        name={name}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <StyledCheckboxContainer>
        {value ? (<FontAwesomeIcon icon={faCheckSquare} />) : (<FontAwesomeIcon icon={faSquare} />)}
      </StyledCheckboxContainer>
      {label}
    </CheckboxLabel>
  </FormInputContainer>
);

FormCheckbox.propTypes = {
  ...commonInputProps,
};

export const FormTextArea = ({
  autoFocus, label, value, onChange, name, placeholder, errorMessage, hasError,
}) => {
  const inputEl = useRef(null);
  useEffect(() => {
    if (autoFocus) {
      inputEl.current.focus();
    }
  });
  const formatErrorMessages = () => {
    if (errorMessage) {
      if (Array.isArray(errorMessage)) {
        if (errorMessage.length > 1) {
          return (
            <ErrorList>
              {errorMessage.map((error) => (<li key={error}><ErrorMessage>{error}</ErrorMessage></li>))}
            </ErrorList>
          );
        }
        return (<ErrorMessage>{errorMessage[0]}</ErrorMessage>);
      }
      return (<ErrorMessage>{errorMessage}</ErrorMessage>);
    }
    return '';
  };
  return (
    <FormInputContainer>
      <StyledLabel htmlFor={name}>{label}</StyledLabel>
      <StyledTextArea
        error={hasError}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        value={value}
        placeholder={placeholder}
      />
      {formatErrorMessages()}
    </FormInputContainer>
  );
};

FormInput.propTypes = {
  ...commonInputProps,
  type: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,

  hasError: PropTypes.bool,
  errorMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf([
      PropTypes.string,
    ]),
  ]),
  inputCaps: PropTypes.node,
};

FormInput.defaultProps = {
  placeholder: '',
  hasError: false,
  errorMessage: '',
  autoFocus: false,
  inputCaps: null,
};

FormTextArea.propTypes = {
  ...commonInputProps,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,

  hasError: PropTypes.bool,
  errorMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf([
      PropTypes.string,
    ]),
  ]),
};

FormTextArea.defaultProps = {
  placeholder: '',
  hasError: false,
  errorMessage: '',
  autoFocus: false,
};

export default FormInput;
