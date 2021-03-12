import styled, { css } from 'styled-components';

export const SectionTitle = styled.h2`
  ${(props) => css`
    ${props.theme.text.sectionTitle}
    &::after {
      ${props.theme.text.sectionTitleAfter}
      background-color: ${props.theme.flavors.pink};
    }
  `}
`;

export default SectionTitle;
