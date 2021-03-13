import styled from 'styled-components';
import FormInputContainer from './FormInputContainer';

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;

  ${FormInputContainer} + ${FormInputContainer} {
    margin-top: 1em;
  }
  ${FormInputContainer}:last-of-type {
    margin-bottom: 1em;
  }
`;

export default StyledForm;