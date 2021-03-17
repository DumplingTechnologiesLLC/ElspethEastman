import styled, { css } from 'styled-components';

export const HeroImage = styled.img`
  ${(props) => css`
    height: ${props.theme.heroImageHeight}px;
    @media screen and (max-width: ${props.theme.breakpoints.heroMedium}) {
      height: ${props.theme.heroImageHeight - 100}px;
      margin-top: 2em;
    }
    @media screen and (max-width: ${props.theme.breakpoints.heroSmall}) {
      height: ${props.theme.heroImageHeight - 200}px;
    }
  `}
`;

export default HeroImage;
