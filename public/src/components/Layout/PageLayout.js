import styled, { css } from 'styled-components';

export const PageLayout = styled.div`
  background-color: white;
  ${(props) => css`
    max-width: ${props.theme.maxContentWidth};
  `}
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;
export const PageContent = styled.main`
  padding: 1em;
  flex: 1;
  ${(props) => css`
    ${props.theme.mixins.navbarBreakpoint(css`
      margin-top: 5em;
    `)}
  `}
`;

export default PageLayout;
