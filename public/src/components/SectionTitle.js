import styled, { css } from 'styled-components';

export const SectionTitle = styled.h2`
  ${(props) => css`
    ${props.theme.text.sectionTitle}
    &::after {
      position: absolute;
      content: ' ';
      left: 0;
      right: 0;
      bottom: -2px;
      height: 2px;
      background-color: #FF9BFF;
    }
  `}
`;

export default SectionTitle;
