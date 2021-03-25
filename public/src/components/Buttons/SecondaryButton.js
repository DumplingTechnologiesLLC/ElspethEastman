import styled, { css } from 'styled-components';

export const SecondaryButton = styled.button`
  ${(props) => css`
    ${props.theme.button.defaultStyling};
    background-color: ${props.theme.flavors.secondary};
    border-color: black;
    color: black;
    &:hover {
      background-color: ${props.theme.flavors.secondaryActive};
    }
    &:focus {
      background-color: ${props.theme.flavors.secondaryActive};
      ${props.theme.mixins.boxShadow(props.theme.flavors.secondaryShadow)};
      outline:0;
    }
    &:disabled {
      cursor: not-allowed;  
      opacity: .5;
      &:hover {
        background-color: ${props.theme.flavors.secondary};
      }
    }

  `}
`;

export default SecondaryButton;
