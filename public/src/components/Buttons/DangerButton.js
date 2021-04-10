import styled, { css } from 'styled-components';
import Button from '@Components/Buttons/Button';

export const DangerButton = styled(Button)`
  ${({ theme }) => css`
    background-color: ${theme.flavors.red};
    border-color: ${theme.flavors.red};
    color: white;
    &:hover {
      border-color: ${theme.flavors.midRed};
      background-color: ${theme.flavors.midRed};
    }
    &:focus {
      ${theme.mixins.boxShadow(theme.flavors.redTransparent)};
    }
  `}
`;

export default DangerButton;
