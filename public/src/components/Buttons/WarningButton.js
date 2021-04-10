import styled, { css } from 'styled-components';
import Button from '@Components/Buttons/Button';

export const WarningButton = styled(Button)`
  ${(props) => css`
    background-color: ${props.theme.flavors.yellow};
    border-color: ${props.theme.flavors.yellow};
    &:hover {
      border-color: ${props.theme.flavors.midYellow};
      background-color: ${props.theme.flavors.midYellow};
    }
    &:focus {
      ${props.theme.mixins.boxShadow(props.theme.flavors.yellowTransparent)};
    }
  `}
`;

export default WarningButton;
