import styled, { css } from 'styled-components';

export const SectionTitleUnderText = styled.span`
  ${(props) => css`
    ${props.theme.text.sectionTitleUnderText}
  `}
`;

export default SectionTitleUnderText;
