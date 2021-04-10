import styled, { css } from 'styled-components';
import FormInputContainer from '@Components/Form/FormInputContainer';

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  ${(props) => css`
    ${FormInputContainer} + ${FormInputContainer} {
      margin-top: ${props.theme.spacing.md};
    }
    ${FormInputContainer}:last-of-type {
      margin-bottom: ${props.theme.spacing.md};
    }
  `}
`;

export default StyledForm;
