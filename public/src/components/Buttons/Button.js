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
    &:disabled {
      opacity: .8;
      pointer-events: none;
      cursor: not-allowed;
    }
  `}
`;

export default Button;
