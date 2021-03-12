import styled, { css } from 'styled-components';

export const ContentTitle = styled.h2`
  ${(props) => css`
    ${props.theme.text.sectionTitle}
  `}
`;

export default ContentTitle;
