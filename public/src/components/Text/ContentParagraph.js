import styled, { css } from 'styled-components';

export const ContentParagraph = styled.p`
  ${(props) => css`
    ${props.theme.text.contentText}
  `}
`;

export default ContentParagraph;
