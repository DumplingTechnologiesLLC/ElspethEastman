import styled, { css } from 'styled-components';
import Button from '@Components/Buttons/Button';

export const PrimaryButton = styled(Button)`
  ${(props) => css`
    background-color: ${props.theme.flavors.blue};
    border-color: ${props.theme.flavors.blue};
    &:hover {
      border-color: ${props.theme.flavors.midBlue};
      background-color: ${props.theme.flavors.midBlue};
    }
    &:focus {
      ${props.theme.mixins.boxShadow(props.theme.flavors.blueTransparent)};
    }
  `}
`;

export default PrimaryButton;
