import styled, { css } from 'styled-components';

export const BackgroundButton = styled.button`
  ${(props) => css`
    ${props.theme.button.defaultStyling};
    background-color: ${props.theme.flavors.background};
    border-color: ${props.theme.flavors.background};
    &:hover {
      outline: 0;
      border-color: ${props.theme.flavors.secondaryActive};
      background-color: ${props.theme.flavors.secondaryActive};
    }
    &:focus {
      outline: 0;
      ${props.theme.mixins.boxShadow(props.theme.flavors.secondaryActive)};
    }
  `}
`;

export default BackgroundButton;
