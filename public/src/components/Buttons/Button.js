import styled, { css } from 'styled-components';

export const Button = styled.button`
  ${(props) => css`
    ${props.theme.button.defaultStyling};
    &:hover {
      outline: 0;
    }
    &:focus {
      outline: 0;
    }
  `}
`;

export default Button;
