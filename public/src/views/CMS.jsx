import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import styled, { css } from 'styled-components';
import AboveTheFold from '@Components/LandingPage/AboveTheFold';
import EditableSkills from '@Components/CMS/EditableSkills.contextual';
import CMSNavbar from '@Components/CMS/CMSNavbar';
import Music from '@Components/LandingPage/Music';
import EditableProjects from '@Components/CMS/EditableProjects.contextual';
import EditableExperience from '@Components/CMS/EditableExperience.contextual';
import routes from '@App/routes';
import DisabledSectionContainer from '@Components/DisabledSectionContainer';
import EditablePageFooter from '@Components/CMS/EditablePageFooter.contextual';

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

export const CMS = () => {
  const mockFunction = () => {};
  return (
    <>
      <CMSNavbar />
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
              <EditableExperience />
              <EditablePageFooter />
            </StyledCMSMainContent>
          </Route>
        </Switch>
      </StyledCMSContent>
    </>
  );
};
export default CMS;
