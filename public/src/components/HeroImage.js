import styled, { css } from 'styled-components';

export const HeroImage = styled.img`
  ${(props) => css`
    height: ${props.theme.heroImageHeight}
  `}
`;

export default HeroImage;
