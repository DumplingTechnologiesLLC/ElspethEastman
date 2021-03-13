import styled, { css } from 'styled-components';

export const JumboTitle = styled.h1`
  ${(props) => css`
    z-index: 0;
      ${props.theme.text.jumboTitle};
      &::after {
        content: '${props.shadowText}';
        ${props.theme.text.jumboTitleShadow}
      }
    `
}
`;

export default JumboTitle;
