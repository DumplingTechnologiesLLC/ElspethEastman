import styled, { css } from 'styled-components';

import Montserrat from '../assets/Montserrat/Montserrat-Regular.woff';
import Dolcissimo from '../assets/Dolcissimo/Dolcissimo.woff';

export const PageLayout = styled.div`
  @font-face {
    font-family: 'Montserrat';
    src: local('Montserrat'), url(${Montserrat}) format('woff');
  }
  @font-face {
    font-family: 'Dolcissimo';
    src: local('Dolcissimo'), url(${Dolcissimo}) format('woff');
  }
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
`;

export default PageLayout;
