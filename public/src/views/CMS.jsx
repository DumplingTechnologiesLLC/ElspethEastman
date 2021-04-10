import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import styled, { css } from 'styled-components';
import AboveTheFold from '@Components/AboveTheFold';
import EditableSkills from '@Components/CMS/EditableSkills';
import CMSNavbar from '@Components/CMS/CMSNavbar';
import Sidebar from '@Components/CMS/Sidebar';
import Music from '@Components/Music';
import EditableProjects from '@Components/CMS/EditableProjects';
import routes from '@App/routes';

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

const DisabledSectionContainer = styled.div`
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
              <DisabledSectionContainer>
                <AboveTheFold onGetInTouch={mockFunction} scrollToWork={mockFunction} />
              </DisabledSectionContainer>
              <EditableSkills />
              <EditableProjects />
              <DisabledSectionContainer>
                <Music />
              </DisabledSectionContainer>
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
