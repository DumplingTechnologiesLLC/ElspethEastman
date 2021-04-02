import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import styled, { css } from 'styled-components';
import AboveTheFold from '../components/AboveTheFold';
import EditableSkills from '../components/EditableSkills';
import CMSNavbar from '../components/CMSNavbar';
import Sidebar from '../components/Sidebar';
import routes from '../routes';

const StyledCMSContent = styled.div`
  padding: 0 50px;
  ${({ theme }) => css`
    ${theme.mixins.navbarBreakpoint(css`
      padding-right: 0;
    `)}
  `}
`;

const StyledCMSMainContent = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    padding: ${theme.spacing.md};
    max-width: ${theme.maxContentWidth};
  `}
`;

const AboveTheFoldContainer = styled.div`
  pointer-events: none;
  opacity: .5;
`;

export const CMS = () => {
  const mockFunction = () => {};
  return (
    <>
      <CMSNavbar />
      <Sidebar />
      <StyledCMSContent>
        <Switch>
          <Route exact path={routes.cms}>
            <StyledCMSMainContent>
              <AboveTheFoldContainer>
                <AboveTheFold onGetInTouch={mockFunction} scrollToWork={mockFunction} />
              </AboveTheFoldContainer>
              <EditableSkills />
            </StyledCMSMainContent>
          </Route>
          <Route path={routes.mail}>
            <StyledCMSMainContent>
              <h1>TODO EMAILS</h1>
            </StyledCMSMainContent>
          </Route>
        </Switch>
      </StyledCMSContent>
    </>
  );
};
export default CMS;
