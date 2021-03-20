import styled, { css } from 'styled-components';

export const PageLayout = styled.div`
  background-color: white;
  ${(props) => css`
    max-width: ${props.theme.maxContentWidth};
  `}
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: relative;
`;
export const PageContent = styled.main`
  flex: 1;
  ${(props) => css`
    padding: ${props.theme.spacing.md} ${props.theme.spacing.md} 0 ${props.theme.spacing.md};
    ${props.theme.mixins.navbarBreakpoint(css`
      margin-top: ${props.theme.spacing.xxl};
    `)}
  `}
`;

export default PageLayout;
