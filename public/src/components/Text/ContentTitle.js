import styled, { css } from 'styled-components';

export const ContentTitle = styled.h2`
  ${(props) => css`
    ${props.theme.text.sectionTitle};
    margin-bottom: 0;
  `}
`;

export default ContentTitle;
