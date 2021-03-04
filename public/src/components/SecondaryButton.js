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
      ${props.theme.mixins.buttonBoxShadow(props.theme.flavors.secondaryShadow)};
      outline:0;
    }

  `}
`;

export default SecondaryButton;
