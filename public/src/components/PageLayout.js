import styled from 'styled-components';

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
  max-width: 1200px;
  margin: 0 auto;
`;
export const PageContent = styled.main`
  padding: 1em;
`;

export default PageLayout;
