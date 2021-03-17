import styled, { css } from 'styled-components';

export const JumboTitle = styled.h1`
  ${(props) => css`
    z-index: 0;
      ${props.theme.text.jumboTitle};
      &::after {
        content: '${props.shadowText}';
        ${props.theme.text.jumboTitleShadow};
        @media screen and (max-width: ${props.theme.breakpoints.heroSmall}) {
          font-size: 68px;
          bottom: 10px;
        }
        @media screen and (max-width: ${props.theme.breakpoints.heroXSmal}) {
          display: none;
        }
      }
    `
}
`;

export default JumboTitle;
