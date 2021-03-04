import styled, { css } from 'styled-components';

export const JumboTitle = styled.h1`
  ${(props) => css`
      ${props.theme.text.jumboTitle};
      &::after {
        content: '${props.shadowText}';
        position: absolute;
        z-index: -1;
        color: rgba(0,0,0,0.05);
        font-size: 95px;
        left: 0%;
        bottom: 0;
      }
    `
}
`;

export default JumboTitle;
