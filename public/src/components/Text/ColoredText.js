import styled, { css } from 'styled-components';

export const StyledText = styled.span`
  ${(props) => css`
    color: ${props.theme.flavors[props.flavor]}
  `}
`;

export default StyledText;
