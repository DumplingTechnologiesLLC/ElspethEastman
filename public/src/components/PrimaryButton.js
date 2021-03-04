import styled, { css } from 'styled-components';

export const PrimaryButton = styled.button`
  ${(props) => css`
    ${props.theme.button.defaultStyling};
    background-color: ${props.theme.flavors.blue};
    border-color: ${props.theme.flavors.blue};
    &:hover {
      outline: 0;
      border-color: ${props.theme.flavors.midBlue};
      background-color: ${props.theme.flavors.midBlue};
    }
    &:focus {
      outline: 0;
      ${props.theme.mixins.buttonBoxShadow(props.theme.flavors.blueTransparent)};
    }
  `}
`;

export default PrimaryButton;
